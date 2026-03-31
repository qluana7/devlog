---
title: "for에 관한 고찰"
slug: "about-for"
date: "2021-06-09"
excerpt: "C#에서 자주 보이는 구문이 하나 있다. 바로 \"for\". ​ for은 반복을 해주는 반복문으로써 꽤 자주 쓰이게 되는데, 최근에 발견한 for에 관한 이야기이다. ​ 우리가 잘 알고 있듯이 for문은 다음과 같이 사용한다. ​ 이를 간단하게 나타내면 ​ 이렇게 나타낼"
tags:
  - "imported"
  - "legacy"
---

<p id="SE-3f677b58-04ba-417e-ab9d-cd556f555eb0">C#에서 자주 보이는 구문이 하나 있다. 바로 "for".</p>
<p id="SE-8804bcd7-d4dd-4551-92bb-a29e2da9a027">​</p>
<p id="SE-d208e745-94f9-4afa-bc7c-2ff638ff3f2a">for은 반복을 해주는 반복문으로써 꽤 자주 쓰이게 되는데, 최근에 발견한 for에 관한 이야기이다.</p>
<p id="SE-771960f3-5f5e-4df5-965c-6d67e6fdb495">​</p>
<p id="SE-e8923ca0-9a2a-41d5-8a9f-561e4dcba815">우리가 잘 알고 있듯이 for문은 다음과 같이 사용한다.</p>
<p><br></p>

```text
for (int i = 0; i < Length; i++)
{
    // Do something
}
```

<p id="SE-63c9bf57-8788-428e-9ce8-e9f7d3e0b757">​</p>
<p id="SE-daddc5a0-3ee1-4656-8782-8f5fb4eba0ff">이를 간단하게 나타내면</p>

```text
for (초기문; 조건문; 증감문)
{
    // 내용
}
```

<p id="SE-2c2db684-154f-4d70-a722-eb1ff3535ee0">​</p>
<p id="SE-6b083a91-50b6-4dbf-ada6-db82f6e3063a">이렇게 나타낼수 있는데,</p>
<p id="SE-223b7fdf-a333-4301-811b-338f7b837b01">​</p>
<p id="SE-8920e61d-bdee-405d-b20a-b4ee0e00036a">대부분의 경우 초기문에는 int i = 0;, 조건문에는 i < Length, 증감문에는 i++를 넣는게 대부분이다.</p>
<p id="SE-2eb0df04-27e3-4504-bc06-26b1d771e367">for은 다음과 같은 원리로 작동하는데..</p>
<p id="SE-5b43f36a-b5d1-4a0f-888a-f426a4ec9166">​</p>
<p id="SE-df579d99-bc3e-4a12-aadf-b8d4260e8505">처음 for문을 만나면 초기문을 실행하고, 매 반복마다 조건문을 검사하여 조건에 맞으면 증감문을 실행하고 조건에 맞지 않으면 빠져나오게 된다.</p>
<p id="SE-501d230f-7d56-4ccc-ae66-05d87bc72192">​</p>
<p id="SE-35a106b0-04b0-4210-80f1-a8b6f49f924d">여기서 "실행한다"의 의미는 단순한 구문을 실행하는 것을 넘어서 Action과 같은 함수도 실행이 가능하다는 뜻이다!</p>
<p id="SE-eb10c15d-7bf5-4caf-ab30-2ef827b981a2">​</p>
<p id="SE-d32eeab2-20b6-40ea-b86c-135932d3e7b0">즉 for문은 다음과 같은 함수로 생각하면 편하다!</p>

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

<p id="SE-0f6c3631-6f75-4637-8f9b-e0aebdf898d0">간단하게 말해서 우리가 쓰고 있던 int i = 0;은 반환 값이 void인 어떠한 함수로 사용 가능하고, 조건에 해당하는 부분은 bool를 반환하는 어떠한 함수, 증감문은 반환 값이 void인 어떠한 함수로 사용이 가능하다는 것이다!</p>
<p id="SE-b9987871-52a6-4459-8886-4f1fde3eb92b">​</p>
<p id="SE-a43dd76a-193e-4628-bda8-127d790952be">for은 초기화를 하던 증감을 하던 신경을 쓰지 않는다. 그저 처음 실행할 때 초기문을 실행하고, 매 반복마다 조건부를 확인하고 반복시 증감문을 실행할 뿐이다.</p>
<p id="SE-a5db52aa-49d6-4748-9668-37cffeda595b">​</p>
<p id="SE-d641ac1a-5253-4eef-bbac-04c7698379e2">for에 대해 아는 것이 있다면 댓글로 공유 해보자.</p>
<p id="SE-1238aa13-d449-48fe-80dd-90a68268736f">​</p>
<p id="SE-c81f1f2d-ab83-40fb-9315-112872dafbf8">+ for vs foreach</p>
<p id="SE-f1be411e-51b1-48dd-a2eb-533c2e354a1c">for과 foreach에 대해서 성능 관련한 여러 이야기가 있는데</p>
<p id="SE-280b435e-d257-4c08-bfbd-2b8fb33b551f">​</p>
<p id="SE-c30c5ab1-5a08-439d-85d2-4e093798f663">간단하게 정리해서 말하자면 인덱싱을 사용하는 반복문은 for이 성능을 더 잘내고,</p>
<p id="SE-703e2781-4ebf-4cb3-b11e-7a4ee997eb34">List와 같이 애초에 무거운 성능을 내는 애들을 쓸 때에는 foreach가 성능이 더 잘난다.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/3deddb35fee7a476a019974b7e6d63ec.png)

</p>
<blockquote>for과 foreach에 대한 성능 실험을 조금 해보았는데 이전에 foreach에 대한 성능 저하 문제가 있다고 나온적이 있었는데 이게 개선이 되었나봐요. 인덱싱을 사용하는 작업이랑 List를 사용하는 작업 모두 성능이 같거나 foreach가 우세하게 나타나내요. 다른 Dictionary나 인덱싱 방식을 사용하지 않는 애들을 가지고 좀더 실험을 해봐야 할거 같은데 일단 foreach가 개선되서 속도가 빨라진건 맞는거 같습니다</blockquote>
