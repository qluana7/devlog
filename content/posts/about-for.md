---
title: "A Study on for (In C)"
slug: "about-for"
date: "2021-06-09"
excerpt: "C#에서 자주 보이는 구문이 하나 있다. 바로 \"for\". for은 반복을 해주는 반복문으로써 꽤 자주 쓰이게 되는데, 최근에 발견한 for에 관한 이야기이다. 우리가 잘 알고 있듯이 for문은 다음과 같이 사용한다. 이를 간단하게 나타내면 이렇게 나타낼수 있는데, 대"
tags:
  - "imported"
  - "legacy"
---

<p>C#에서 자주 보이는 구문이 하나 있다. 바로 "for".</p>
<p><br></p>
<p>for은 반복을 해주는 반복문으로써 꽤 자주 쓰이게 되는데, 최근에 발견한 for에 관한 이야기이다.</p>
<p><br></p>
<p>우리가 잘 알고 있듯이 for문은 다음과 같이 사용한다.</p>
<p><br></p>

```text
for (int i = 0; i < Length; i++)
{
    // Do something
}
```

<p><br></p>
<p>이를 간단하게 나타내면</p>

```text
for (초기문; 조건문; 증감문)
{
    // 내용
}
```

<p><br></p>
<p>이렇게 나타낼수 있는데,</p>
<p><br></p>
<p>대부분의 경우 초기문에는 int i = 0;, 조건문에는 i < Length, 증감문에는 i++를 넣는게 대부분이다.</p>
<p>for은 다음과 같은 원리로 작동하는데..</p>
<p><br></p>
<p>처음 for문을 만나면 초기문을 실행하고, 매 반복마다 조건문을 검사하여 조건에 맞으면 증감문을 실행하고 조건에 맞지 않으면 빠져나오게 된다.</p>
<p><br></p>
<p>여기서 "실행한다"의 의미는 단순한 구문을 실행하는 것을 넘어서 Action과 같은 함수도 실행이 가능하다는 뜻이다!</p>
<p><br></p>
<p>즉 for문은 다음과 같은 함수로 생각하면 편하다!</p>

```text
public void For(Action init, Func<bool> condition, Action increase)
{
    init();

    while (true)
    {
    	if (condition()) break;
        
        // Do something
        
       increase();
    }
}
```

<p>간단하게 말해서 우리가 쓰고 있던 int i = 0;은 반환 값이 void인 어떠한 함수로 사용 가능하고, 조건에 해당하는 부분은 bool를 반환하는 어떠한 함수, 증감문은 반환 값이 void인 어떠한 함수로 사용이 가능하다는 것이다!</p>
<p><br></p>
<p>for은 초기화를 하던 증감을 하던 신경을 쓰지 않는다. 그저 처음 실행할 때 초기문을 실행하고, 매 반복마다 조건부를 확인하고 반복시 증감문을 실행할 뿐이다.</p>
<p><br></p>
<p>for에 대해 아는 것이 있다면 댓글로 공유 해보자.</p>
<p><br></p>
<p>+ for vs foreach</p>
<p>for과 foreach에 대해서 성능 관련한 여러 이야기가 있는데</p>
<p><br></p>
<p>간단하게 정리해서 말하자면 인덱싱을 사용하는 반복문은 for이 성능을 더 잘내고,</p>
<p>List와 같이 애초에 무거운 성능을 내는 애들을 쓸 때에는 foreach가 성능이 더 잘난다.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/3deddb35fee7a476a019974b7e6d63ec.png)

</p>
<blockquote>for과 foreach에 대한 성능 실험을 조금 해보았는데 이전에 foreach에 대한 성능 저하 문제가 있다고 나온적이 있었는데 이게 개선이 되었나봐요. 인덱싱을 사용하는 작업이랑 List를 사용하는 작업 모두 성능이 같거나 foreach가 우세하게 나타나내요. 다른 Dictionary나 인덱싱 방식을 사용하지 않는 애들을 가지고 좀더 실험을 해봐야 할거 같은데 일단 foreach가 개선되서 속도가 빨라진건 맞는거 같습니다</blockquote>
