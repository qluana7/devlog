---
title: "[WPF] Background(Brush)에 대해서"
slug: "backgroundbrush"
date: "2021-06-09"
excerpt: "WPF를 사용하면서 가장 많이 사용되는 프로퍼티. Background 오늘은 Brush 관련한 이야기를 해보려 한다 ​ WinForm에는 System.Drawing에서 Color 구조체를 사용하지만 WPF에서는 System.Windows.Media.Brush를 사용한다"
tags:
  - "Blur"
  - "brush"
  - "DRAWING"
  - "transparent"
  - "window"
  - "WPF"
---

<p id="SE-b25201dd-1541-4171-8d7c-0a43bffe5931">WPF를 사용하면서 가장 많이 사용되는 프로퍼티. Background</p>
<p id="SE-1e113a4f-8126-428b-9bc4-721b81e4297a">오늘은 Brush 관련한 이야기를 해보려 한다</p>
<p id="SE-376cae15-1886-4c48-bcb5-ac174b4e1d61">​</p>
<p id="SE-b35ea92f-ce81-4767-b384-6a2a778d0f51">WinForm에는 System.Drawing에서 Color 구조체를 사용하지만 WPF에서는 System.Windows.Media.Brush를 사용한다.</p>
<p id="SE-1a0ad8c7-a5ec-4921-895e-ab5e84d2bf5d">​</p>
<p id="SE-b214b8a6-83d8-49b4-b2cb-326ac19862a4">Background같은 경우 xaml에서 enum객체를 사용하는 것처럼 보이는데 이는 System.Windows.Media에 Brushes라는 클래스를 이용한다.</p>
<p>Background를 C#에서 정의할 때 다음 코드를 사용한다.</p>

```text
button1.Background = Brushes.Black;
```

<p id="SE-68831085-56e3-47d3-bc43-57b05bba6ef5">그렇다면 System.Drawing.Color처럼 hex코드를 이용할 수는 없는가?</p>
<p id="SE-3625cb95-a492-49d7-b7a0-7140aab03761">​</p>
<p id="SE-f270984e-2f03-4671-ad64-74d8083a51f5">답은 "사용할 수 있다"이다</p>
<p id="SE-2b19dfb7-9f39-417d-9720-b8907af3981a">​</p>
<p id="SE-9b5c29ef-505f-4abc-b71e-769c5eb70aa9">xaml의 경우 Background="#000000" 같이 정해진 값 대신 hex코드를 사용해 쓸수도 있고</p>
<p id="SE-c22a9e64-f51e-4141-b6c5-b8101eab9683">C#의 경우 다음과 같이 사용할 수 있다</p>

```text
button1.Background = new BrushConverter().ConvertFromString("#000000") as Brush;
```

<p id="SE-0384401c-94e5-4df7-a2cd-de74d2e10417">​</p>
<p id="SE-45a00ccd-ca8a-4605-b854-c40174d2a544">이번에는 투명 배경을 사용해보자.</p>
<p id="SE-1127f0bc-43b3-441e-a5dd-ba250e238ba6">xaml에 Background="Transparent" 로 정의하면 투명한 배경이 만들어지게 되는데 이는 문제점이 아주 많다</p>
<p id="SE-60d5c390-d98a-45ef-9389-10584e0b3c9c">​</p>
<p id="SE-2270dd8a-5436-4a28-93aa-4655e267ea76">기본적으로 Transparent로 설정되는 경우 대부분의 마우스 이벤트를 발생시키지 않는다(!!)</p>
<p id="SE-b590d038-731f-465e-a94c-f443b87603d2">(MouseHover, MouseEnter, MouseLeave, MouseDown, MouseUp,</p>
<p id="SE-70653c6c-4ad5-44c3-b43c-2373fb580653">MouseClick, MouseDoubleClick 등등)</p>
<p id="SE-36c7d990-15a9-4884-8c8d-e12d6d029f65">​</p>
<p id="SE-089e53e2-e4e0-45af-ba66-fba1386ba71c">물론 Transparent로 설정된 객체 위에 불투명한 객체나 그림이 있다면 해당 부분은 이벤트가 발생하긴 한다.</p>
<p id="SE-53aaef5f-62b7-4b40-b301-fbf15da1409d">그러나 DragMove()를 사용하면서 배경을 투명하게 사용하는 경우 등의 상황에서 이는 불편한점이 매우 많이 생긴다.</p>
<p id="SE-12a8fcb7-887e-46ae-9eb3-3132d7666f72">​</p>
<p id="SE-8fa4afe4-acc8-49cd-9b78-d5d64bbd9976">이를 해결하기 위해서 메인 Grid에 Opacity를 조절해보았다. 그러나 메인 Grid의 Opacity를 조절하게 되면 그리드의 자식 컨트롤까지 모두 영향을 받아 투명해지므로 이는 해결 방법이 될 수 없다.</p>
<p id="SE-94d6b3b1-f3d3-4c4a-bbdc-80ce0facd2a7">​</p>
<p id="SE-5439eac6-9820-48e7-a2f5-f18b394ac075">그렇다면 어떻게 해결해야하는가?</p>
<p id="SE-1f91797c-c791-41f6-883b-84c86f55234a">​</p>
<p id="SE-06a1e4cb-2a80-4dd0-9d7d-4848203465a3">이 문제를 해결해 줄 하나의 해결책을 찾았다.</p>
<p id="SE-5e8fa4bb-5c8b-4e25-90df-49b68b1804d2">​</p>

<div class="embed-card"><a class="embed-card-link" href="https://stackoverflow.com/questions/1646346/create-a-fully-transparent-wpf-window-to-capture-mouse-events" target="_blank" rel="noreferrer noopener"><div class="embed-card-media"><img src="https://blog.kakaocdn.net/dna/qu0dk/hyKwJExnrK/AAAAAAAAAAAAAAAAAAAAAJLb_Hr5orGgHMdgofC7C2VAMO5A3Iy4LPaxsoRleTLt/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1774969199&allow_ip=&allow_referer=&signature=pfZcxJA%2Fz43ASnc%2BQZ9QSPdDrfs%3D" alt="Create a fully transparent WPF window to capture mouse events" loading="lazy" /></div><div class="embed-card-body"><p class="embed-card-title">Create a fully transparent WPF window to capture mouse events</p><p class="embed-card-desc">I'm trying to trap mouse events in WPF by using a topmost, transparent non-modal window. I'm finding that this works fine if the opacity of the window is 0.01 or greater and it has a background co...</p><p class="embed-card-host">stackoverflow.com</p></div></a></div>

<p id="SE-a51c82df-322d-41bb-bef3-413d9bb3eff0">간단하게 요약하자면</p>
<blockquote>
<p id="SE-ea237291-0593-420b-95f1-97d0b113a32c">Transparent를 사용하는 경우 해당 이벤트들을 작동하게 할 수 있는 방법은 없다.</p>
<p id="SE-209a2c52-1a7e-43d8-852c-9d602de77468">그러나 Backgroun를 Transparent가 아닌 #01000000으로 설정하게 되면, Alpha값이 01이므로 투명하면서도 마우스 이벤트를 감지 할 수 있다.<br><br></p>
</blockquote>
<p id="SE-421cf088-a4f9-4af2-8b95-d814d377f8ad">이로써 투명한 배경에서 마우스 이벤트를 잡을 수 있게 되었다!</p>
<p><br></p>
<hr contenteditable="false" />
<p id="SE-23621c7e-e221-4851-822f-facfabe410a5">추가 팁! 이미지에 블러를 적용할 수 있는 옵션이 있는데, 이를 Window를 상속받은 객체에게 적용할 수도 있다!</p>
<p id="SE-8208ac62-ba0d-4f07-976d-11777b0a66a5">​</p>

<div class="embed-card"><a class="embed-card-link embed-card-no-media" href="https://pastebin.com/VcJLria4" target="_blank" rel="noreferrer noopener"><div class="embed-card-body"><p class="embed-card-title">WindowBlur - Pastebin.com</p><p class="embed-card-desc">Pastebin.com is the number one paste tool since 2002. Pastebin is a website where you can store text online for a set period of time.</p><p class="embed-card-host">pastebin.com</p></div></a></div>

<p id="SE-af736f57-eba9-4717-a6d7-a3a9216daf7a">해당 클래스를 프로젝트에 넣어준 뒤 "new WindowBlur().EnableBlur(this)"를 사용해주면 된다.</p>
<p id="SE-f2748f3a-ece9-4350-9e24-e99d957b478c">이때 this는 블러 효과를 적용할 Window 객체를 상속받은 클래스여야 한다.</p>
