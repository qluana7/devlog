---
title: "Switch (string) 성능에 관한 고찰"
slug: "switch-string"
date: "2022-08-08"
excerpt: "C# 타입 키워드에는 여러개가 존재한다. 그 중, C/C++, Java에 없는 키워드가 하나 존재하는데, 바로 오늘의 주인공 string이다. C/C++에서는 사용할 수 없는 기능, switch문에 string을 쓰는 방식에 대해 알아보고자 한다. char* 또는 st"
tags:
  - "C#"
  - "csharp"
  - "dictionary"
  - "HASH"
  - "Performance"
  - "Roslyn"
  - "String"
  - "switch"
---

<p>C# 타입 키워드에는 여러개가 존재한다. 그 중, C/C++, Java에 없는 키워드가 하나 존재하는데,</p>
<p>바로 오늘의 주인공 string이다.</p>
<p><br></p>
<p>C/C++에서는 사용할 수 없는 기능, switch문에 string을 쓰는 방식에 대해 알아보고자 한다.</p>
<p><br></p>
<p>char* 또는 string을 switch에 넣을 수 없는 C/C++과 다르게, C#은 switch에서도 string이 사용가능하다.</p>
<p><br></p>
<p>곰곰히 생각해보면 의문점이 생긴다. C/C++에서 switch에 string을 못넣는 이유는 당연하다.</p>
<p>왜냐? 비교할 방법이 없기 때문이다.</p>
<p>C/C++을 공부해본 사람이라면 알 수 있을 것이다. char* == char*은 문자열 비교가 아니라 포인터 비교란 걸.</p>
<p><br></p>
<p>물론, strcmp이나 string 클래스에서는 ==를 지원하지만 결국 이는 O(n)의 작업이기 때문에 한없이 느리다.</p>
<p>(C++의 경우 C와의 호환성 면에서 도입이 안됐을 가능성도 있다고 본다.)</p>
<p><br></p>
<p>그런 이유에서 switch에 string이 안들어가는 것으로 볼 수 있는데, C#에는 이가 가능하다는 것은, 매우 느린 비교를 사용하고 있는 것인가에 대한 의문을 야기한다.</p>
<p><br></p>
<p>결론부터 이야기 하자면, 그렇지 않다!</p>
<p><br></p>
<p>C#에서 switch string을 처리하는 방식을 알아보도록 하자.</p>
<p><br></p>
<p>먼저, <a title="Roslyn" href="https://github.com/dotnet/roslyn" target="_blank" rel="noopener">Roslyn</a>. (ms에서 만든 오픈소스 .NET 컴파일러이다)</p>
<p>Roslyn의 경우, 두 가지 경우로 나뉘게 된다.</p>
<p>(케이스가 적은 경우, 케이스가 많은 경우)</p>
<p><br></p>
<p>아직 정확한 기준에 대한 것은 없지만</p>
<p><br></p>
<p>적은 경우에는 if else문을 이용해 구성하게 된다.</p>
<p>많은 경우에는 해싱을 이용하여 if else 문을 구성한다.</p>
<p><br></p>
<p>Unity의 경우에는 이를 처리하는 방식이 조금 다른데,</p>
<p><br></p>
<p>Unity의 경우, Dictionary를 이용한다.</p>

```text
new Dictionary<string, int>() {
    { "1", 0 },
    { "2", 1 },
    { "3", 2 }
};
```

<p>위와 같이 Dictionary를 하나 구성하고 int 값을 얻어와서 switch를 돌리는 방식으로 구성되어 있다.</p>
<p><br></p>
<p>아래 출처에서 디컴파일 된 소스 코드를 볼 수 있으니 참고해보자.</p>
<p><br></p>
<p>정리하면,</p>
<blockquote>switch(string)의 경우, 거의 O(1) 수준의 성능을 내기는 하나, 일반적인 상수의 switch보다는 안정성을 기대할 수는 없다.</blockquote>
<p><br></p>
<p>정보 출처 : <a href="https://forum.unity.com/threads/how-slow-are-case-switches-using-strings.428283/" target="_blank" rel="noopener">https://forum.unity.com/threads/how-slow-are-case-switches-using-strings.428283/</a></p>
