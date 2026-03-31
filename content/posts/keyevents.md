---
title: "[WPF + WinForms] About Key Events"
slug: "keyevents"
date: "2021-06-09"
excerpt: "win32 를 보다보면 여러 신기한 메소드들이 많이 구현되어 있다. 그중에서 오늘은 keybd_event라는 메소드를 소개하겠는데, 이름에서 보이는것처럼 키보드 이벤트를 발생시키는 메소드다. keybd_event는 C++으로 user32.dll에 다음과 같이 정의되어 "
tags:
  - "KEY"
  - "Keybd_Event"
  - "keydown"
  - "keyinterop"
  - "Keys"
  - "user32"
  - "Win32"
  - "Winform"
---

<p>win32 를 보다보면 여러 신기한 메소드들이 많이 구현되어 있다.</p>
<p>그중에서 오늘은 keybd_event라는 메소드를 소개하겠는데, 이름에서 보이는것처럼 키보드 이벤트를 발생시키는 메소드다.</p>
<p><br></p>
<p>keybd_event는 C++으로 user32.dll에 다음과 같이 정의되어 있다</p>

```cpp
void keybd_event(
  BYTE      bVk,         // Key Value
  BYTE      bScan,       // Hardware Scan
  DWORD     dwFlags,     // Key State (Up/Down)
  ULONG_PTR dwExtraInfo  // Key Stroke
);
```

<p>C#에서 다음과 같이 Import해서 사용할 수 있는데...</p>

```text
[DllImport("user32.dll")]
public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

// EnterKey
keybd_event(0x0D, 0x45, 0x1, UIntPtr.Zero);
```

<p>나머지 정보는 다른 사이트에서 알아볼 수 있다. 그런데 여기서 문제가 생긴다.</p>
<p>bVk는 키보드에서 무슨 키인지를 알려주는 정보인데 이는 Winform에서 System.Windows.Forms.Keys 를 byte로 바꾸면 간편하게 이용할 수 있다. 그러나...</p>
<p><br></p>
<p>WPF를 사용하는 경우 System.Windows.Input.Key 를 사용하게 만드는데... 이는 KeyDown 과 같은 이벤트에도 적용되므로 문제가 생겨버린다.</p>
<p><br></p>
<p>dotnet docs에 가보면 Keys와 Key는 정의된 값이 다르다. 그러므로 변환 작업이 필요한데...</p>
<p><br></p>
<p>일단 System.Windows.Forms.Keys를 사용하기 위해 참조를 추가해준다.</p>
<p><br></p>
<p>WPF를 Net 5.0이나 Core 버전을 사용하시는 분들은 Winform 참조를 하면 정보수집이 꽤나 오래걸리는데 csproj에서 다음 코드를 추가함으로써 winform을 바로 사용할 수 있다.</p>

```text
<UseWindowsForms>true</UseWindowsForms>
```

<p>이제 변환을 하면 되는데.. 처음에는 Enum.Parse를 이용해 보았지만, 이는 예외의 경우가 너무 많고 변환이 힘들다는 단점이 있다. 그래서 검색끝에 찾아낸 방법이 있다</p>
<p><br></p>
<p>바로 KeyInterop 라는 클래스가 존재했던 것(!!)</p>
<p><br></p>
<p>KeyInterop 클래스는 KeyFromVirtualKey, VirtualKeyFromKey 이 두 메소드를 가지고 있는데</p>
<p>KeyFromVirtualKey는 WPF Key에서 Winform Keys로, VirtualKeyFromKey는 그 반대로 변환해준다.</p>

```text
var keys = (Keys)KeyInterop.VirtualKeyFromKey(Key.Enter);
var key = KeyInterop.KeyFromVirtualKey((int)Keys.Enter);
```

<p>이를 통해서 변환 작업을 끝냈다! 이제 keybd_event를 wpf에서도 사용할 수 있다!</p>
<p><br></p>
<figure><a>
<div> </div>
<div>
<p>Keys 열거형 (System.Windows.Forms)</p>
<p>키 코드와 한정자를 지정합니다.Specifies key codes and modifiers.</p>
<p>docs.microsoft.com</p>
</div>
</a></figure>
<p><br></p>
<p>Keys의 열거형은 docs에 잘 나와있으니 아래 링크를 확인해보자</p>
<p>Win32 api는 재밌고 유용한 것들이 많으니 함 찾아보는 것도 나쁘지 않을 거 같다.</p>
<p>재밌거나 유용한 정보를 알고 있다면 댓글로 나누어 보자.</p>
