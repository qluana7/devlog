---
title: "On the Relationship Between bool and int (In C)"
slug: "int-to-bool"
date: "2022-03-12"
excerpt: "0은 false고 나머지를 true로 받는 이유는 C 컴파일러 마음대로 이기 때문이다. 역어셈을 해보면 int -> bool하는 과정은 그저 cmp 하나로 작성되어 있음을 알 수 있다 cmp 변수 0x0 (cmp는 compare) 실제로 다음 코드를 역어셈 해보면 재밌"
tags:
  - "bool"
  - "C"
  - "cast"
  - "compare"
  - "INT"
  - "비교"
---

<p>0은 false고 나머지를 true로 받는 이유는 C 컴파일러 마음대로 이기 때문이다.</p>
<p><br>역어셈을 해보면 int -> bool하는 과정은 그저 cmp 하나로 작성되어 있음을 알 수 있다<br>cmp 변수 0x0 (cmp는 compare)</p>
<p><br></p>
<p>실제로 다음 코드를 역어셈 해보면 재밌는 사실을 알 수 있다</p>

```cpp
int main() {
  int n = 5;
  n = !n;

  return 0;
}
```

<p><br></p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/2ff1be078e9a8505d6ada1a2df9f1ee3.png)

</p>
<p>설명</p>
<p>1줄 : 변수에 5를 할당한다<br>2줄 : 변수랑 0을 비교해서 Zero Flag를 설정한다<br>3줄 : Zero Flag에 따라서 0또는 1을 al 레지스터에 넣는다<br>4줄 : al 레지스터의 값을 eax 레지스터에 넣는다<br>5줄 : n에 eax의 값. 즉 Zero Flag에 따라 생성된 0 또는 1의 값이 들어간다</p>
<p><br></p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/a40af54d323697e110670aa7b2713dce.png)

</p>
<p>따라서 n이 0이 아니기 때문에 Zero flag에 의해서</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/7a1993cd4b64db010e90243076f3f572.png)

</p>
<p>sete는 0을 반환한다</p>
<p><br></p>
<p>이후 그 0이 n에 들어가게 되는 것이다</p>
<p><br></p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/5359003f39d23b22ca1df701f95794de.png)

</p>
<p>이렇게 n = 0인 상황에서는 cmp가 Zero를 true 설정하기 때문에</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/6c5fac072f7aa5513822266a1bc1f1ce.png)

</p>
<p>값이 달라진다.</p>
