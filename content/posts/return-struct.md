---
title: "struct 반환에 대한 고찰"
slug: "return-struct"
date: "2023-04-06"
excerpt: "함수의 반환에 대한 고찰 오늘은 함수 반환에 대해 간단하게 알아보고자 한다. * 컴파일 옵션은 다음과 같다 gcc -o Main Main.c -O0 보통 함수에서 값을 반환하게 되면, eax(32bits), rax(64bits) 레지스터를 사용하게 된다. 그리하여 th"
tags:
  - "assembly"
  - "C"
  - "C언어"
  - "NASM"
  - "return"
  - "struct"
  - "struct반환"
---

<div class="embed-card"><a class="embed-card-link" href="https://thinkcs.tistory.com/entry/function-return" target="_blank" rel="noreferrer noopener"><div class="embed-card-media"><img src="https://blog.kakaocdn.net/dna/K5zzu/hySaYWNvhu/AAAAAAAAAAAAAAAAAAAAALw8P2JoVkau-3I99oeeBp-JFDMbWUVA5HjAqQT2FMzO/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1774969199&allow_ip=&allow_referer=&signature=MRhJ95bY8WlOsWXyJ56%2BtyHwDGw%3D" alt="함수의 반환에 대한 고찰" loading="lazy" /></div><div class="embed-card-body"><p class="embed-card-title">함수의 반환에 대한 고찰</p><p class="embed-card-desc">오늘은 함수 반환에 대해 간단하게 알아보고자 한다. * 컴파일 옵션은 다음과 같다 gcc -o Main Main.c -O0 보통 함수에서 값을 반환하게 되면, eax(32bits), rax(64bits) 레지스터를 사용하게 된다. 그리하여</p><p class="embed-card-host">thinkcs.tistory.com</p></div></a></div>

<p>예전이 이런 포스팅을 한적이 있었다.</p>
<p><br></p>
<p>어셈블리를 사용하면서 얻은 지식이 있어 추가적으로 보완하고자 글을 쓰게 되었다.</p>
<p><br></p>
<p>struct를 반환하게 되면 어셈블리에선 어떠한 일이 일어나는가? 에 대해서 알아보도록 하자</p>
<p><br></p>
<p>일단 먼저 struct는 레지스터에 들어갈 수 있는 크기가 아니다 보니 값 그 자체로 반환되지는 않는다.</p>
<p>보통 struct를 반환하는 함수 내에서 어딘가에는 struct를 선언하는 코드가 존재한다. 즉, 해당 함수 내의 스택에 struct크기 만큼의 공간을 확보해둔다는 의미이다.</p>
<p><br></p>
<p>이제 return하는 시점으로 돌아와 보자.</p>
<p><br></p>
<p>return을 하게 되면 보통 다음과 같이 호출자에서 반환된 struct를 받아 할당하게 된다</p>

```cpp
struct Point {
    int x, y;
}

Point getPoint() {
    Point p;
    // Do something
    
    return p;
}

int main() {
    Point p = getPoint();
}
```

<p>(대충 알아볼 수 있게 코드를 짰으니 문법 오류와 관련한 이야기는 넘어가도록 하자)</p>
<p><br></p>
<p>struct를 반환할 때에는 함수 내에 스택에 선언된 struct의 <b>포인터</b>를 반환한다.</p>
<p>즉, rax(eax)에 들어가는 값은 호출한 함수의 스택에 선언되어 있는 struct를 가리키는 것이란 소리이다.</p>
<p><br></p>
<p>저 코드를 예시로 어셈블리로 봐보자.</p>
<p><br></p>

```asm
section .text
(생략...)

getPoint:
    push ebp
    mov ebp, esp
    ; Point크기 만큼 스택 할당
    sub esp, 8
    
    ; Do something
    
    lea eax, [ebp-8]
    leave
    ret

main:
    push ebp
    mov ebp, esp
    ; Point크기 만큼 스택 할당
    sub esp, 8
    
    call getPoint
    mov ebx, [eax]
    mov [ebp-8], ebx
    mov ebx, [eax+4]
    mov [ebp-4], ebx
    
    (생략...)
```

<p><br></p>
<p>이러한 식으로 동작할 수 있다는 얘기이다.</p>
<p><br></p>
<p>여기서 하나 알고 넘어가야 할 점은, 반환된 포인터가 가리키는 위치이다.</p>
<p>보통 반환된 포인터가 가리키는 위치는 struct의 맨 첫번째 값이다.</p>
<p>위 예제에선 Point.x 가 될 것이다. 그 뒤로 순서대로 바이트가 증가하는 구조를 갖는다.</p>
<p><br></p>
<p>그럼 여기서 의문점이 든다.</p>
<p>"함수 호출 후 ret으로 빠져나오면 함수의 스택이 정리되게 되며 이 공간은 다른 데이터에 의해 오염될 가능성이 있지 않나요?"</p>
<p><br></p>
<p>이 내용도 틀린 내용은 아니다.</p>
<p>그러나 우리가 주의 깊게 봐야 할 것은 함수 호출 후 호출자에서 Point sturct를 선언하여 할당 받고 있다는 것이다.</p>
<p><br></p>
<p>함수가 종료되어도 프로그램은 해당 함수가 사용했던 곳을 0으로 채우거나 값을 변경하지 않는다.</p>
<p>따라서 함수가 종료된 이후에 받은 포인터를 통해서 호출자의 스택에 해당 포인터의 값을 옮기는 방식을 사용할 수 있는 것이다.</p>
<p><br></p>
<p>다만, 호출하기 전 미리 공간 할당을 해놓은 상태여야 한다.</p>
<p><br></p>
<p>C에선 편하게 사용되는 것들이 어셈블리에선 복잡한 기능으로 얽혀있는 경우가 종종 있다.</p>
<p>struct도 예외는 아니다.</p>
<p><br></p>
<p>여담으로,</p>
<p>struct 반환에 대해서 이해가 갈때 쯤 드는 의문이 하나 있다.</p>
<p>"그렇다면 struct* 의 반환은 어떻게 될까?"</p>
<p><br></p>
<p>참 재밌게도 struct와 struct*모두 struct의 위치를 갖는 포인터를 반환한다.</p>
