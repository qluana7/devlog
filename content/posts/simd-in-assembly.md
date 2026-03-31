---
title: "SIMD in Assembly"
slug: "simd-in-assembly"
date: "2023-04-10"
excerpt: "오늘 할 것은 Assembly에서 \"직접\" SIMD를 사용해보는 것이다. (구글링과 직접 실험을 통해 얻은 지식을 바탕으로 한 것이기 때문에 더 효율적이고 보편적인 코드가 있을 수 있음) 가끔 프로그램을 분해 해보면 movups같은 이상한 instruction들이 보이"
tags:
  - "Align"
  - "assembly"
  - "movaps"
  - "movdqa"
  - "movdqu"
  - "movups"
  - "simd"
  - "stackalign"
---

<p>오늘 할 것은 Assembly에서 "직접" SIMD를 사용해보는 것이다.</p>
<p>(구글링과 직접 실험을 통해 얻은 지식을 바탕으로 한 것이기 때문에 더 효율적이고 보편적인 코드가 있을 수 있음)</p>
<p><br></p>
<p>가끔 프로그램을 분해 해보면 movups같은 이상한 instruction들이 보이곤 하는데, SIMD랑 연관이 있는 명령어 였다.</p>
<p><br></p>
<p>SSE의 경우 xmm이란 128 레지스터를 사용하는데 값을 xmm에 로드하기 위해서 사용되는 명령어가 바로</p>
<p>movups, movaps, movdqa, movdqu가 있다. (이 외에도 꽤 많은 명령어가 있다)</p>
<p><br></p>
<p>이런 명령어를 통해서 xmm에 값을 로드할 수 있는데 SIMD를 사용할 땐 아주 중요한게 하나 있다.</p>
<p>바로 align을 맞춰야 한다는 것.</p>
<p><br></p>
<p>stack align에 대해서 간단하게 설명하고 넘어가자면 (자세한건 따로 찾아보길 바란다)</p>
<p>함수 호출 시 스택 포인터가 특정 바이트 배수에 위치하도록 정렬하는 것을 의미한다.</p>
<p><br></p>
<p>이게 무슨 소리냐면, 16바이트로 align을 맞추게 된다고 하면 (스택 포인터 & 0xf)는 항상 0을 가지게 될 것이란 소리다.즉 스택의 크기가 16의 배수로 맞춰진단 소리인데</p>
<p><br></p>
<p>이게 왜 중요하냐면 C의 경우에는 SIMD가 사용될 때 컴파일러에 의해서 알아서 최적화 되어 align이 맞춰진 상태에서 SIMD가 돌아간다.근데 어셈블리에선 개발자가 직접 호출하기에 align이 어긋나 있으면 문제가 발생할 수 있다.</p>
<p><br></p>
<p>특히 movaps, movdqa를 보면, 이 명령어들은 align 상태여야만 사용할 수 있는 명령어 들이다.align 상태가 아니라면 SIGSEGV(segfault)를 일으킨다</p>
<p><br></p>
<p>그러면 align 상태가 아닐때도 동작하는 movups, movdqu를 사용하면 되지 않냐? 라고 얘기할 수 있겠지만이 명령어들은 movaps, movdqa에 비해 성능 문제가 생길 수 있다.</p>
<p><br></p>
<p>알아본 결과 cpu가 처리하는 방식과 관련이 있다고 하는데..간단히 설명하면 블럭 별로 데이터를 처리하는데, align이 맞춰져 있지 않으면 여러 블럭을 건너 읽어야 하고이런식으로 연속된 메모리를 읽는 과정에서 캐시 미스가 발생할 수 있기 때문이라고 한다.</p>
<p><br></p>
<p>이야기가 길어졌는데, 보통 이런 align 문제를 해결하기 위해서 함수 초반에 align을 맞춰주는 작업을 수행한다.</p>
<p>(SSE를 사용할 것이기 때문에 16바이트 align을 기준으로 할 것이다.)</p>
<p><br></p>
<p>간단한 방법으로 align을 맞출 수 있는데, 바로 and instruction 하나면 된다!</p>
<p><br></p>
<p>위해서 한 얘기를 유심히 보면 알 수 있다.</p>
<p>바로 esp의 주소와 0xf를 and 연산 하는 것이다.</p>
<p>(스택은 거꾸로 가기 때문에 0xf와 연산해서 원하는 크기보다 작아질 순 없다)</p>
<p><br></p>
<p>편하게 쓰기 위해서 난 다음과 같이 구현해서 사용하고 있다.</p>

```asm
simd:
    push ebp
    mov ebp, esp
    
    sub esp, 16  ; allocate stack
    and esp, -16 ; align stack (-16 = 0xFFFFFFF0)
    
    ; Do something
    
    xor eax, eax
    leave
    ret
```

<p><br></p>
<p>추가적으로 test를 이용해서 현재 스택의 align 여부를 확인할 수 있다.</p>

```asm
test esp, 0xf
je aligned
```

<p>aligned 상태라면 je를 타고 aligned 라벨로 이동하게 된다.</p>
<p><br></p>
<p>이제 본격적으로 SIMD를 한번 사용해보자!</p>
<p><br></p>
<p>간단하게 두 벡터를 더하는 코드를 만들어 보자</p>

```asm
section .data align=16 ; data section의 변수들의 align을 맞추는 작업
    vector1: dd 1, 2, 3, 4
    vector2: dd 5, 6, 7, 8
    
section .text
    ; nasm -> gcc 과정으로 빌드하므로 main이 시작점. libc를 사용하기 위함
    global main
    
; Entrypoint
main:
    push ebp
    mov ebp, esp
    
    sub esp, 16  ; simd 결과 값을 저장할 스택 변수
    and esp, -16 ; align 맞추기
    
    ; 데이터를 xmm에 로드
    movaps xmm0, [vector1]
    movaps xmm1, [vector2]
    ; paddd : Packed Add Dword
    ; dword 크기의 두 벡터를 더하기 위한 명령어
    paddd xmm0, xmm1
    ; 덧셈의 결과를 스택 변수로 로드
    movaps [esp], xmm0
    
    xor eax, eax
    leave
    ret
```

<p><br></p>
<p>이런식으로 두 벡터를 더해 [6, 8, 10, 12]의 벡터를 얻어낼 수 있다.</p>
<p><br></p>
<p>이외에도 AVX, AVX2, AVX512(지원할 경우)와 관련한 명령어도 존재한다. (256, 512레지스터를 사용할 수 있다)</p>
<p><br></p>
<p>* 잘못된 내용이 있으면 댓글로 적어주시면 감사하겠습니다.</p>
