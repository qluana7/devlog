---
title: "prefix { REX, VEX, EVEX } : REX 편"
slug: "rex-prefix"
date: "2025-01-31"
excerpt: "어셈블리를 하다보면 여러가지 종류의 prefix가 있는 것을 볼 수 있다. 오늘은 REX에 대해서 먼저 알아보자. 사실 실제로 어셈블리를 하면서 REX prefix를 직접 만나는 일은 없었을 것이다. 왜냐하면 저 prefix는 어셈블리에 알게 모르게 어셈블러에 의해 처"
tags:
  - "assembly"
  - "AVX"
  - "EVEX"
  - "evex prefix"
  - "NASM"
  - "REX"
  - "rex prefix"
  - "VEX"
---

<p>어셈블리를 하다보면 여러가지 종류의 prefix가 있는 것을 볼 수 있다.</p>
<p><br></p>
<p>오늘은 REX에 대해서 먼저 알아보자.</p>
<hr contenteditable="false" />
<p><br></p>
<p>사실 실제로 어셈블리를 하면서 REX prefix를 직접 만나는 일은 없었을 것이다.</p>
<p><br></p>
<p>왜냐하면 저 prefix는 어셈블리에 알게 모르게 어셈블러에 의해 처리되고 있기 때문이다.</p>
<p><br></p>
<p>다음 코드를 한번 봐보자</p>

```bash
mov rax, edx
```

<p><br></p>
<p>이 코드에 무려 REX prefix가 들어있다.</p>
<p><br></p>
<p>이 코드를 바이트 코드 형태로 분석해보자.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/2c292c920270ffe37183007fe860c5af.png)

</p>
<p>48 : REX.W</p>
<p>89 : mov r/m16/32/64 r16/32/64</p>
<p>d0 : modr/m (11 000:rax 010:rdx)</p>
<p><br></p>
<p>REX.W라는 REX prefix가 붙은 것을 볼 수 있다.</p>
<p><br></p>
<p>결론부터 이야기 하자면 REX prefix는 <b>R</b>egister <b>EX</b>tension prefix라는 의미인데, 이는 64bits 레지스터에 대한 prefix임을 알 수 있다.</p>
<p><br></p>
<p>64bits에서 rax와 rdx 대신, eax와 edx를 쓴다면?</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/ce7ed6a49440210c3ea9df280e8ec3d1.png)

</p>
<p>보이는 것 처럼 REX.W라는 prefix가 사라진 것이 보일 것이다.</p>
<p><br></p>
<p>REX prefix에 대해 깊게 들어가보자.</p>
<hr contenteditable="false" />
<p><br></p>
<h3>REX prefix</h3>
<p>REX preifx는 다음과 같은 비트 구조를 갖는다.</p>
<table border="1">

7
6
5
4
3
2
1
0

0
1
0
0
W
R
X
B

</table>
<p><br></p>
<p>여기서 앞 bits[7:4]는 REX preifx의 고유 이름이라고 보면 된다. 즉, prefix 자리에 16진수로 0x4_로 시작한다면, 해당 바이트는 REX prefix로 간주된다는 의미이다.</p>
<p><br></p>
<p>그럼 이제 bits[3:0]에 있는 비트에 대해 알아보자.</p>
<p><br></p>
<table border="1">

W
64 Bit Operand Size

R(Register)
Extension of ModR/M reg field

X(eXtended)
Extension of SIB index field

B(Base)
Extension of r/m field, base field, or opcode reg field

</table>
<p><br></p>
<p>W는 위에서 보이듯 operand 자리에 들어가는 레지스터의 size를 결정하는 식이다.</p>
<p><br></p>
<p>R은 아래의 ModR/M 표를 보면 알 수 있다.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/9ab778375236752faafcc1c546712fb5.png)

</p>
<p>오른쪽에 보면 REX.R = 1이라는 부분이 보일 것이다.</p>
<p><br></p>
<p>R비트가 활성화 되면 ModR/M을 결정할 때, 왼쪽에 보이는 부분을 사용하는 것이 아니라 오른쪽에 회색으로 되어 있는 부분을 사용하게 되는 것이다.</p>
<p>간단하게 말해서, R8 ~ R15 레지스터를 사용할 수 있다는 이야기이다!</p>
<p><br></p>
<p>X를 설명하기 전에, B를 먼저 봐보자.</p>
<p><br></p>
<p>위 표 왼쪽을 보면 REX.B = 1이 보일 것이다.</p>
<p><br></p>
<p>위의 R의 설명과 유사하게 B비트가 활성화 되면 Effective Address의 회색 부분을 사용하게 되는 것이다.</p>
<p><br></p>
<p>이때 중요한 것은, sib라고 되어 있는 부분에는 변함이 없는데, 이 부분은 SIB 표를 보면서 설명을 이어나가겠다.</p>
<p><br></p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/b8a51b0c6912dfe023921f62bf6a23f7.png)

</p>
<p>이 표에서 보면 오른쪽 위에 REX.B = 1이 보일 것이다.</p>
<p><br></p>
<p>그렇다. sib 모드일때는 SIB에서의 Base에 대한 확장을 지원하는 것이 보인다.</p>
<p><br></p>
<p>다시 왼쪽을 보면 아까 설명하지 않은 REX.X = 1이 보일 것이다.</p>
<p><br></p>
<p>X는 Scale에 대한 확장을 지원하는 비트이다.</p>
<p><br></p>
<p>위의 표를 보면 알겠지만, W, R, B, X 모두 중첩이 가능하다.</p>
<p><br></p>
<p>가령, 다음과 같은 명령어를 인코딩한다고 생각해보자.</p>

```bash
mov r8, [r8+r8]
```

<p><br></p>
<p>이러면 모든 REX에 대해 비트가 켜져있어야 함으로, 우리가 예상한 그대로의 결과를 보여준다.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/12d38a025c28376ac1539fc97c96c683.png)

</p>
<p><br></p>
<p>REX의 경우 매우 간단한 구조를 가지고 있으며, ModR/M표와 SIB표를 이용하여 쉽게 해당 비트를 구할 수 있다.</p>
<p><br></p>
<p>그러나, 이것은 시작에 불과하다. 다음 글에서부터 avx와 avx2에서 사용되는 prefix인 VEX에 대해서 설명할 예정이다.</p>
<p><br></p>
<p>REX에 비해 구조도 어렵고 처음 봤을때 이해하는데 조금 시간이 걸렸었다.</p>
<p><br></p>
<p>VEX가 이정도인데 EVEX는 오죽하겠는가.</p>
<hr contenteditable="false" />
<p><br></p>
<p>여담.</p>
<p><br></p>
<p>사실 이러한 지식들은 어셈블리를 작성하는데 있어선 몰라도 되는 지식이다.</p>
<p><br></p>
<p>가령 리버싱에서도 툴을 이용해 바꾸어 주기 때문에, 사실상 의미가 없긴 하다.</p>
<p><br></p>
<p>다만, 이러한 지식을 통해 어셈블리가 어떤식으로 인코딩되고, 어떠한 방식을 사용하는지를 알아볼 수 있고,</p>
<p><br></p>
<p>이를 통해 어셈블리를 설계하는데에 있어 방식에 대한 구조 이해와 추가적인 아이디어를 제공할 수 있는 것이라고 생각한다.</p>
<p><br></p>
<p><b>물론, 필자는 이런 생각 없이 단순 호기심으로 알아본 것은 사실이다.</b></p>
