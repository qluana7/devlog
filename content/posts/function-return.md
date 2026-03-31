---
title: "A Study on Function Return Semantics"
slug: "function-return"
date: "2022-12-27"
excerpt: "오늘은 함수 반환에 대해 간단하게 알아보고자 한다. * 컴파일 옵션은 다음과 같다 보통 함수에서 값을 반환하게 되면, eax(32bits), rax(64bits) 레지스터를 사용하게 된다. 그리하여 main에서 int를 반환할때도 eax나 rax에 exit_code를 "
tags:
  - "C"
  - "disassemble"
  - "disassembly"
  - "GCC"
  - "return"
  - "struct"
  - "반환"
  - "함수"
---

<p>오늘은 함수 반환에 대해 간단하게 알아보고자 한다.</p>
<p><br></p>
<p>* 컴파일 옵션은 다음과 같다</p>

```bash
gcc -o Main Main.c -O0
```

<p><br></p>
<p>보통 함수에서 값을 반환하게 되면, eax(32bits), rax(64bits) 레지스터를 사용하게 된다.</p>
<p>그리하여 main에서 int를 반환할때도 eax나 rax에 exit_code를 전달해서 main을 탈출하게 되는데.</p>
<p><br></p>
<p>여기서 한가지 의문이 생기게 된다.</p>
<p><br></p>
<p>그렇다면 구조체 같이 복잡한 구조의 타입을 반환하면 어떻게 될까?</p>
<p><br></p>
<p>다음과 같이 한 구조체를 만들고 컴파일을 한 뒤 어셈블리 코드로 뜯어보았다</p>

```cpp
typedef struct {
    int a, b, c;
} A;

A test() {
    A a = { 1, 2, 3 };
    return a;
}

int main() {
	A a = test();
    return a.a - 1;
}
```

<p>생각보다 신기한 결과를 내놓았다.</p>
<p><br></p>
<p>main에서 먼저 구조체의 크기만큼 스택변수를 할당해준 뒤 해당 스택 변수의 위치를 rcx(ecx)에 담고 함수를 호출하였다.</p>
<p><br></p>
<p>그 뒤 test 함수에서는 받은 rcx의 주소 값을 바탕으로 해당 위치에 구조체의 값을 차례대로 넣었고 eax(rax)에 받았던 주솟값을 다시 돌려주었다.</p>
<p><br></p>
<p>그리하여 마지막 return a.a - 1에서는 main에서 할당해두었던 곳에서 읽어서 반환하는 것을 보였다.</p>
<p><br></p>
<p>우리가 주목해야할 것은 test라는 녀석이 반환한 것이 결국 포인터라는 것이다.</p>
<p><br></p>
<p>eax, rax의 크기에 맞지 않는 반환 타입을 갖는 함수는 그 이전 함수에서 미리 공간을 만들고 메모리 주소를 넘겨주어 값을 반환 받는 방식으로 돌아가는 것 같다.</p>
<p><br></p>
<p>이번에는 다음과 같이 main 함수를 고쳐서 뜯어보았다</p>

```cpp
int main() {
	return test().a - 1;
}
```

<p>아마도 최적화 옵션을 -O0으로 주어서 그런지 위에와 같은 결과를 보였다.</p>
<p><br></p>
<p>정리하자면, 정수 타입의 경우에는 eax, rax에 값을 그대로 넣어서 반환하지만, 구조체와 같은 복합 데이터 형식은 미리 할당한 스택 변수를 통해 값을 주고 받는다고 할 수 있다.</p>
