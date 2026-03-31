---
title: "[WPF] Understanding Background (Brush)"
slug: "backgroundbrush"
date: "2021-06-09"
excerpt: "WPF를 사용하면서 가장 많이 사용되는 프로퍼티. Background 오늘은 Brush 관련한 이야기를 해보려 한다 WinForm에는 System.Drawing에서 Color 구조체를 사용하지만 WPF에서는 System.Windows.Media.Brush를 사용한다. "
tags:
  - "Blur"
  - "brush"
  - "DRAWING"
  - "transparent"
  - "window"
  - "WPF"
---

<p>WPF를 사용하면서 가장 많이 사용되는 프로퍼티. Background</p>
<p>오늘은 Brush 관련한 이야기를 해보려 한다</p>
<p><br></p>
<p>WinForm에는 System.Drawing에서 Color 구조체를 사용하지만 WPF에서는 System.Windows.Media.Brush를 사용한다.</p>
<p><br></p>
<p>Background같은 경우 xaml에서 enum객체를 사용하는 것처럼 보이는데 이는 System.Windows.Media에 Brushes라는 클래스를 이용한다.</p>
<p>Background를 C#에서 정의할 때 다음 코드를 사용한다.</p>

```text
button1.Background = Brushes.Black;
```

<p>그렇다면 System.Drawing.Color처럼 hex코드를 이용할 수는 없는가?</p>
<p><br></p>
<p>답은 "사용할 수 있다"이다</p>
<p><br></p>
<p>xaml의 경우 Background="#000000" 같이 정해진 값 대신 hex코드를 사용해 쓸수도 있고</p>
<p>C#의 경우 다음과 같이 사용할 수 있다</p>

```text
button1.Background = new BrushConverter().ConvertFromString("#000000") as Brush;
```

<p><br></p>
<p>이번에는 투명 배경을 사용해보자.</p>
<p>xaml에 Background="Transparent" 로 정의하면 투명한 배경이 만들어지게 되는데 이는 문제점이 아주 많다</p>
<p><br></p>
<p>기본적으로 Transparent로 설정되는 경우 대부분의 마우스 이벤트를 발생시키지 않는다(!!)</p>
<p>(MouseHover, MouseEnter, MouseLeave, MouseDown, MouseUp,</p>
<p>MouseClick, MouseDoubleClick 등등)</p>
<p><br></p>
<p>물론 Transparent로 설정된 객체 위에 불투명한 객체나 그림이 있다면 해당 부분은 이벤트가 발생하긴 한다.</p>
<p>그러나 DragMove()를 사용하면서 배경을 투명하게 사용하는 경우 등의 상황에서 이는 불편한점이 매우 많이 생긴다.</p>
<p><br></p>
<p>이를 해결하기 위해서 메인 Grid에 Opacity를 조절해보았다. 그러나 메인 Grid의 Opacity를 조절하게 되면 그리드의 자식 컨트롤까지 모두 영향을 받아 투명해지므로 이는 해결 방법이 될 수 없다.</p>
<p><br></p>
<p>그렇다면 어떻게 해결해야하는가?</p>
<p><br></p>
<p>이 문제를 해결해 줄 하나의 해결책을 찾았다.</p>
<p><br></p>
<figure><a>
<div> </div>
<div>
<p>Create a fully transparent WPF window to capture mouse events</p>
<p>I'm trying to trap mouse events in WPF by using a topmost, transparent non-modal window. I'm finding that this works fine if the opacity of the window is 0.01 or greater and it has a background co...</p>
<p>stackoverflow.com</p>
</div>
</a></figure>
<p>간단하게 요약하자면</p>
<blockquote>
<p>Transparent를 사용하는 경우 해당 이벤트들을 작동하게 할 수 있는 방법은 없다.</p>
<p>그러나 Backgroun를 Transparent가 아닌 #01000000으로 설정하게 되면, Alpha값이 01이므로 투명하면서도 마우스 이벤트를 감지 할 수 있다.<br><br></p>
</blockquote>
<p>이로써 투명한 배경에서 마우스 이벤트를 잡을 수 있게 되었다!</p>
<p><br></p>
<hr>
<p>추가 팁! 이미지에 블러를 적용할 수 있는 옵션이 있는데, 이를 Window를 상속받은 객체에게 적용할 수도 있다!</p>
<p><br></p>
<figure><a>
<div> </div>
<div>
<p>WindowBlur - Pastebin.com</p>
<p>Pastebin.com is the number one paste tool since 2002. Pastebin is a website where you can store text online for a set period of time.</p>
<p>pastebin.com</p>
</div>
</a></figure>
<p>해당 클래스를 프로젝트에 넣어준 뒤 "new WindowBlur().EnableBlur(this)"를 사용해주면 된다.</p>
<p>이때 this는 블러 효과를 적용할 Window 객체를 상속받은 클래스여야 한다.</p>
