---
title: "[WPF + Winform] KeyEvents에 대해서"
slug: "keyevents"
date: "2021-06-09"
excerpt: "win32 를 보다보면 여러 신기한 메소드들이 많이 구현되어 있다. 그중에서 오늘은 keybd_event라는 메소드를 소개하겠는데, 이름에서 보이는것처럼 키보드 이벤트를 발생시키는 메소드다. ​ keybd_event는 C++으로 user32.dll에 다음과 같이 정의되"
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

<p id="SE-d807a593-5265-4314-9f93-508c9237b607">win32 를 보다보면 여러 신기한 메소드들이 많이 구현되어 있다.</p>
<p id="SE-f61d72cb-4c5e-49f2-b295-3140cdcd7888">그중에서 오늘은 keybd_event라는 메소드를 소개하겠는데, 이름에서 보이는것처럼 키보드 이벤트를 발생시키는 메소드다.</p>
<p id="SE-e07d51fe-afd9-45f5-976c-121993ff53de">​</p>
<p>keybd_event는 C++으로 user32.dll에 다음과 같이 정의되어 있다</p>

```cpp
void keybd_event(
  BYTE      bVk,         // Key Value
  BYTE      bScan,       // Hardware Scan
  DWORD     dwFlags,     // Key State (Up/Down)
  ULONG_PTR dwExtraInfo  // Key Stroke
);
```

<p id="SE-0a40a56a-c77e-4a40-82f9-7dfa97ae69d6">C#에서 다음과 같이 Import해서 사용할 수 있는데...</p>

```text
[DllImport("user32.dll")]
public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

// EnterKey
keybd_event(0x0D, 0x45, 0x1, UIntPtr.Zero);
```

<p id="SE-fbd6691e-00ea-43ea-96bf-cbe7fb6fd1be">나머지 정보는 다른 사이트에서 알아볼 수 있다. 그런데 여기서 문제가 생긴다.</p>
<p id="SE-1b8ad9cd-2b38-4a96-8370-7bcd85676ab5">bVk는 키보드에서 무슨 키인지를 알려주는 정보인데 이는 Winform에서 System.Windows.Forms.Keys 를 byte로 바꾸면 간편하게 이용할 수 있다. 그러나...</p>
<p id="SE-bcdb9764-bd4b-4b38-81a4-d4cfb573474b">​</p>
<p id="SE-a6b05419-a35d-46ea-995f-9fdf5c41b0e1">WPF를 사용하는 경우 System.Windows.Input.Key 를 사용하게 만드는데... 이는 KeyDown 과 같은 이벤트에도 적용되므로 문제가 생겨버린다.</p>
<p id="SE-44a33c38-084a-47bf-b556-f1ad9126cf29">​</p>
<p id="SE-e5ff3a19-cb55-41ac-8bd4-cea15b05cefd">dotnet docs에 가보면 Keys와 Key는 정의된 값이 다르다. 그러므로 변환 작업이 필요한데...</p>
<p id="SE-816e837a-afc6-4664-b39a-95e96b22033e">​</p>
<p id="SE-67abc22f-2d41-4bec-8a77-bbadd911844b">일단 System.Windows.Forms.Keys를 사용하기 위해 참조를 추가해준다.</p>
<p id="SE-9f18e889-2bd0-418e-84f8-72e5dc06b15a">​</p>
<p id="SE-5507d2a2-c7ee-440a-b5f2-9f7421ad6d3e">WPF를 Net 5.0이나 Core 버전을 사용하시는 분들은 Winform 참조를 하면 정보수집이 꽤나 오래걸리는데 csproj에서 다음 코드를 추가함으로써 winform을 바로 사용할 수 있다.</p>

```text
<UseWindowsForms>true</UseWindowsForms>
```

<p id="SE-61e00e43-6bca-4573-acce-66d9e2db8550">이제 변환을 하면 되는데.. 처음에는 Enum.Parse를 이용해 보았지만, 이는 예외의 경우가 너무 많고 변환이 힘들다는 단점이 있다. 그래서 검색끝에 찾아낸 방법이 있다</p>
<p id="SE-b2abd985-a52f-4fb4-865c-cddf252e160a">​</p>
<p id="SE-a4f2f6a6-5ec1-4c92-9413-18d66188c8bc">바로 KeyInterop 라는 클래스가 존재했던 것(!!)</p>
<p id="SE-1e37abd8-cea2-4239-aed4-bc8d7be3ee97">​</p>
<p id="SE-16b52e42-cd7b-4cd6-8c47-d319d6e969f2">KeyInterop 클래스는 KeyFromVirtualKey, VirtualKeyFromKey 이 두 메소드를 가지고 있는데</p>
<p id="SE-7e60bd47-492c-4c80-a97c-f81310ed2cfd">KeyFromVirtualKey는 WPF Key에서 Winform Keys로, VirtualKeyFromKey는 그 반대로 변환해준다.</p>

```text
var keys = (Keys)KeyInterop.VirtualKeyFromKey(Key.Enter);
var key = KeyInterop.KeyFromVirtualKey((int)Keys.Enter);
```

<p id="SE-558e1710-ece7-4cc2-a91e-e8ba987e9c0d">이를 통해서 변환 작업을 끝냈다! 이제 keybd_event를 wpf에서도 사용할 수 있다!</p>
<p id="SE-1b30fdf0-c9df-401d-aa89-31b7fb5d5f1c">​</p>

<div class="embed-card"><a class="embed-card-link" href="https://docs.microsoft.com/ko-kr/dotnet/api/system.windows.forms.keys" target="_blank" rel="noreferrer noopener"><div class="embed-card-media"><img src="https://blog.kakaocdn.net/dna/cBTRsc/hyKvqT8Yi6/AAAAAAAAAAAAAAAAAAAAAJv_Lvaeaw01KQCsz9hEhfTKqp33KZQ64F0sQ9EWZecC/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1774969199&allow_ip=&allow_referer=&signature=pI3HqAeOsi8c2sIDkQ7s5s5TC%2Bw%3D" alt="Keys 열거형 (System.Windows.Forms)" loading="lazy" /></div><div class="embed-card-body"><p class="embed-card-title">Keys 열거형 (System.Windows.Forms)</p><p class="embed-card-desc">키 코드와 한정자를 지정합니다.Specifies key codes and modifiers.</p><p class="embed-card-host">docs.microsoft.com</p></div></a></div>

<p><br></p>
<p id="SE-1cbab144-56ee-4e8c-8af3-8a2bda4eb5ee">Keys의 열거형은 docs에 잘 나와있으니 아래 링크를 확인해보자</p>
<p id="SE-13000494-0916-4082-b136-ea3a1843d83f">Win32 api는 재밌고 유용한 것들이 많으니 함 찾아보는 것도 나쁘지 않을 거 같다.</p>
<p id="SE-dfe4aad5-1f40-49a2-8493-405dc638e357">재밌거나 유용한 정보를 알고 있다면 댓글로 나누어 보자.</p>
