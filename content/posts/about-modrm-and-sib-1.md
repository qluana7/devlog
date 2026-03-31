---
title: "About ModR/M and SIB (Part 1)"
slug: "about-modrm-and-sib-1"
date: "2023-12-18"
excerpt: "최근 어셈블리를 사용하던 도중 왜 돌아가지 라는 생각이 드는 코드가 있었다. 엥? 뭐가 문제인데요? 이전 글 을 참고해 보자. Scale의 경우에는 보이다 싶이 1, 2, 4, 8만 사용될 수 있다. 그렇다. Instruction 상에는 저런 SIB가 존재할 수 없다는"
tags:
  - "assembly"
  - "disassemble"
  - "instruction"
  - "modr/m"
  - "modrm"
  - "sib"
  - "어셈블리"
---

<p>최근 어셈블리를 사용하던 도중 왜 돌아가지 라는 생각이 드는 코드가 있었다.</p>

```bash
mov eax, [arr+edx*3]
```

<p><br></p>
<p><i>엥? 뭐가 문제인데요?</i></p>
<p><br></p>
<p><a>이전 글</a>을 참고해 보자.</p>
<blockquote>Scale의 경우에는 보이다 싶이 1, 2, 4, 8만 사용될 수 있다.</blockquote>
<p><br></p>
<p>그렇다. Instruction 상에는 저런 SIB가 존재할 수 없다는 얘기다.</p>
<p><br></p>
<p>가장 간단한 방법을 통해 어떤일이 벌어졌는지 알아보자.</p>
<p>gdb로 빌드된 파일을 역어셈 해보았더니</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/5b7f64954f44da9dfc0511f85d3eb7a1.png)

</p>
<p><br></p>
<p>맞다. 눈치 빠른 사람은 벌써 눈치를 챘을 텐데</p>
<p>원래 우리가 해석할려고 했던 것에서 뭐가 문제인지 알아냇을 것이다.</p>
<p><br></p>
<p>저 코드를 이상하다고 보고 해석했다면,</p>
<p>arr을 base, edx를 index, 3을 scale로 해석했을 것이다.</p>
<p><br></p>
<p>arr을 base로 두어야 하는가? ModR/M에서 SIB 형태만 존재하는게 아닐텐데?</p>
<p>이것이 제일 핵심인 것이다.</p>
<p><br></p>
<p>이번엔 분해된 코드를 보자</p>
<p><br></p>
<p>이번에는 arr이 ModR/M에서의 disp32를 담당하고 있으며</p>
<p>edx가 base, edx가 index, 2가 scale을 담당하고 있다.</p>
<p><br></p>
<p>이러면 이제 말이 된다.</p>
<p>ModR/M에 있던 형태중 하나인, SIB + disp32와 SIB의 [edx*2] + edx 라는 형태가 사용되어 결합된 명령어가 된 것이다.</p>
<p><br></p>
<p>같은 논리로, 3뿐만 아니라 5, 9까지 되는 것을 확인해볼 수 있다.</p>
