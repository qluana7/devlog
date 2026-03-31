---
title: "main의 반환형에 관한 고찰 (In C)"
slug: "main-return-c"
date: "2022-05-04"
excerpt: "들어가기 앞서 - 해당 글은 GCC와 C파일을 기준으로 작성되었습니다. 컴파일러마다 다를 수도 있습니다. 기본적으로 어셈을 배울 때 종료 시에 eax 또는 rax를 0으로 초기화한 후 ret을 해주는 과정을 볼 수 있다 C언어에서 main에서 return 0;을 사용하"
tags:
  - "C"
  - "C언어"
  - "disassemble"
  - "GCC"
  - "int main"
  - "Main"
  - "return"
  - "return 0"
---

<blockquote>들어가기 앞서<br>- 해당 글은 GCC와 C파일을 기준으로 작성되었습니다. 컴파일러마다 다를 수도 있습니다.</blockquote><p> <br>기본적으로 어셈을 배울 때 종료 시에 eax 또는 rax를 0으로 초기화한 후 ret을 해주는 과정을 볼 수 있다</p>

```cpp
xor eax, eax ; = 0
mov eax, 0   ; 위와 같은 코드이다. 그러나 위를 많이 쓰는 경향이 있다.
ret          ; 종료 지시문 (return)
```

<p>C언어에서 main에서 return 0;을 사용하는 것과 같다고 보면 된다.<br><br>GCC의 경우 return 0을 안넣어도 알아서 추가해주는 똑똑한 컴파일러다.<br>그런데 여기서 의문이 생긴다.<br><br><i>"만약, main의 반환형이 int가 아니라 다른 타입이면 어떤 일이 발생할까?"</i><br><br>처음에는 int와 void의 비교를 위해서 두 코드를 역어셈 해보았다.</p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/3ff9d90d127d3156335ded0e30cbbfa9.png)

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/9b6716fd37348c815de72ad7c75e6d0e.png)

<p>두 코드의 차이점을 보자면 void에서는 eax(어셈블리에서 함수의 반환 값으로 주로 사용되는 레지스터)를 0으로 만드는 부분이 nop으로 대체되어있다<br>(nop은 간단히 말해 아무것도 실행하지 않는다는 구문이다. 이유가 궁금하다면 검색해보길 바란다)<br><br>이로써 eax의 초기화가 이루어지지 않은체 프로그램을 종료하는데<br>대부분 알다 싶이 main 함수의 반환 값은 OS에게 전달된다.<br><br><b>즉, 반환 값이 무엇인지는 아무도 알 수 없다는 것이다</b><br> <br><br>이후 추가적으로 알아보기 위하여 void 타입 외에도 다른 타입에 대해서 실험을 진행해보았다.<br> </p>

```cpp
long long main() { }
short main() { }
char main() { }
...
struct tmp { int x; };
struct tmp main() { }
```

<p>놀랍게도, 모두 void와 같은 코드를 생성해냈다. 그러나, return 값이 있는 경우 해당 값을 eax에 집어넣는 코드가 생겼다.<br> <br>결론적으로 알 수 있는 것은,</p><blockquote>GCC의 경우 main의 반환형이 0인 경우에 대해 서면 자동적으로 return 0 코드를 생성해준다.</blockquote><p>로 정리할 수 있을 것 같다.<br><br><br>+ 수정<br><br>C 표준 상으로 다음과 같은 내용이 정의되어 있다.<br>- C99 이전)<br>return시 값을 전달하지 않거나, 그러한 경우에 } 를 만날 경우, 해당 return문은 무시되며 운영체제에게 반환되는 종료 상태(int)는 정해지지 않는다.<br>-C99 부터)<br>반환형이 int와 호환 가능한 자료형이 아닐 경우, 반환 상태는 정해지지 않은 값이 된다.<br>그 외에 int와 호환 가능 한 경우에 return이 존재하지 않아도, }를 만나면 return 0;을 한 것과 같은 동작을 한다.<br><br>참고 : <a href="https://en.cppreference.com/w/c/language/main_function" target="_blank">main function</a> (Explanation - 3)</p>
