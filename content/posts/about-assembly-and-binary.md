---
title: "About Assembly and Machine Code"
slug: "about-assembly-and-binary"
date: "2023-06-10"
excerpt: "최근 IR -> Binary 프로젝트를 작업하면서 Instruction이 Byte코드로 변환되는 과정을 공부했었다. 여러 블로그와 인텔 문서까지 봤는데 좀 쉽게 설명하면서 내용을 정리하고자 올린다. ( Intel&reg; 64 and IA-32 Architectures"
tags:
  - "assembly"
  - "Binary"
  - "byte"
  - "instruction"
  - "modr/m"
  - "opcode"
  - "sib"
  - "바이트코드"
---

<p>최근 IR -> Binary 프로젝트를 작업하면서 Instruction이 Byte코드로 변환되는 과정을 공부했었다.<br><br>여러 블로그와 인텔 문서까지 봤는데 좀 쉽게 설명하면서 내용을 정리하고자 올린다.<br>(<a>Intel&reg; 64 and IA-32 Architectures Software Developer Manuals</a> < Intel 메뉴얼)</p>
<p>(<a>http://ref.x86asm.net/coder.html</a> < opcode 목록 *AVX 미포함* )<br><br>어셈블리와 기계어가 왜 1:1 대응인지 알아보러 가보자<br><br></p>
<h2>Instruction Format</h2>
<p><br>Instruction의 구조는 간단하면서도 생각외로 복잡하다. 다음 표를 보자</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/07de142efb727503af403cd5ae330735.png)

</p>
<p>Instruction 하나에 많은 것들이 들어가는데 앞에서부터 천천히 살펴보자<br><br></p>
<h4>Instruction Prefix</h4>
<p>말 그대로 Instruction의 접두사이다.<br><br>어셈블리에선 그닥 들어나지 않는 부분인데 생각보다 많이 쓰인다.<br><br>REX와 같이 매개변수에 영향을 주기도 하며 REP의 반복 기능과 같이 특정 Instruction의 행동에 변화를 준다.<br><br>이 녀석은 필수적인 요건이 아니다.<br>1바이트 크기를 갖고 여러개가 존재할 수 있다.<br><br></p>
<h4>Opcode</h4>
<p>opcode는 명령 코드라도 보면 된다.<br><br>어떤 명령어를 실행할지를 이녀석이 결정한다고 보면 된다.<br><br>보통은 1바이트 크기를 갖지만 경우에 따라서 2바이트, 많게는 3바이트까지 늘어나는데,</p>
<p>2바이트의 경우 0x0F가 앞에 붙는 형식으로 작동한다.</p>
<p><br></p>
<p>당연하게도 명령 코드를 나타내기에 Instruction에서 필수 요건이다.</p>
<p><br></p>
<h4>Mod R/M</h4>
<p>표를 보면 1바이트 크기로 Mod, Reg/Opcode R/M 이라 되어 있는데 아래 표를 보면 된다.</p>
<p>(더 자세한 건 위에 있는 opcode 목록에서 최 하단을 보면 32/64비트 용으로 통합되어 있다)</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/88740d680e9aeac4d4a871441a3bf6fd.png)

</p>
<p>저 표에 따라서 ModR/M의 값이 정해지게 되는데, 이녀석이 하는 일은 단순하다.</p>
<p><br></p>
<p>Instruction에서는 매개변수의 종류가 Register일때도 있고 Memory일때도 있는데 이를 결정해주는 수단이라고 보면 된다.</p>
<p><br></p>
<p>즉, 매개변수의 타입을 결정해준다고 보면 된다. 자세한건 예시를 들면서 설명할 예정이다.</p>
<p><br></p>
<p>이 녀석은 필수적인 조건이 아니다.</p>
<p>Opcode에 따라서 ModR/M이 필요한 Opcode도 있고 아닌 Opcode도 있다는 소리다.</p>
<p><br></p>
<h4>SIB</h4>
<p>얘도 Scale Index Base 3가지로 분류되어 있는데 별거 없다. 영어 뜻 그대로이다.</p>
<p><br></p>
<p>보통 계산은 Base + Index * Scale로 이루어지며 간단하게 의도를 알아보자면</p>
<p>Base : 기본이 되는 주소. (주로 배열이나 스택의 시작지점을 잡는다.)</p>
<p>Index : 몇 번째에 있는 지를 나타내기 위한 숫자 ( arr[0]으로 치면 0에 해당하는 부분)</p>
<p>Scale : 해당 자료형의 크기를 결정하는 숫자 (int arr[]이면 sizeof(int) = 4 가 되는 방식)</p>
<p><br></p>
<p>SIB는 다음 표를 따르게 된다.</p>
<p>(ModR/M과 마찬가지로 해당 사이트에서 ModR/M표에서 더 내리면 SIB표가 존재한다)</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/bd836f9294fb7e5a6c0d7c34cd15b419.png)

</p>
<p>참고로 Scale의 경우에는 보이다 싶이 1, 2, 4, 8만 사용될 수 있다.</p>
<p><br></p>
<p>이 SIB는 위에 ModR/M코드에서 [--][--]가 있는 ModR/M으로 결정되면 사용된다.</p>
<p><br></p>
<p>따라서 이 녀석도 필수적인 조건이 아니다.</p>
<p><br></p>
<h4>Displacement</h4>
<p> 이 녀석은 해석하자면 변위인데, ModR/M을 보면 disp라고 보일텐데 그게 이녀석이다.</p>
<p><br></p>
<p>disp8은 8bits(= 1byte) 크기의 변위, disp32는 32bits(= 4bytes) 크기의 변위를 나타낸다.</p>
<p><br></p>
<p>보통 메모리에 접근할 때 쓰이며 intel 문법 기준으로 [eax+0x4]와 같이 사용될 때 0x4가 이 녀석이다.</p>
<p><br></p>
<p>이 녀석도 ModR/M에 따르기 때문에 필수적인 조건이 아니다.</p>
<p><br></p>
<h4>Immediate</h4>
<p>즉각적인, 직접의 뜻을 갖고 있는 이 녀석은 상수 값을 나타낼 때 쓰는 녀석이다.</p>
<p><br></p>
<p>Opcode를 보다보면 imm8, imm16같은게 보이는데 그게 이녀석이다.</p>
<p><br></p>
<p>역시나 Opcode에 따르기 때문에 필수적인 조건이 아니다.</p>
<p><br></p>
<h3>Examples</h3>
<p>예시를 들어보면서 확인해보자.</p>
<p><br></p>
<p>가장 많이 사용하는 mov부터 보자</p>

```bash
mov eax, [ebp+8]
```

<p>위와 같은 식이 있을 때 위에 내용을 바탕으로 정리해보자</p>
<p>1. 해당 명령어에 필요한 prefix는 존재하지 않는다.</p>
<p>2. mov (Register, Memory)의 형태를 갖는 Opcode는 0x8B이다.</p>
<p>3. ModR/M을 살펴볼때 eax / [ebp] + disp8의 조합을 갖는 녀석은 0x45이다.</p>
<p>4. ModR/M에서 SIB를 요구하지 않기에 SIB는 존재하지 않는다.</p>
<p>5. Displacement는 보이는 것 처럼 0x8이다.</p>
<p>6. Immediate는 존재하지 않는다.</p>
<p><br></p>
<p>따라서 저 Instruction은 0x8B 0x45 0x08 와 같이 번역될 것이다.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/75f4565890c36683fb76d17eb5bc1a9c.png)

</p>
<p><br></p>
<p>이번엔 다른 예시를 봐보자</p>

```bash
xor rax, [rbp+rcx*4+0x8]
```

<p>1. 64비트 모드에서 64비트 레지스터가 사용되면 64비트 레지스터를 사용한다는 0x48 Prefix가 붙는다.</p>
<p>2. xor (Register, Memory)의 형태를 갖는 Opcode는 0x33이다.</p>
<p>3. ModR/M을 볼때 rax / [SIB] + disp8의 조합을 갖는 녀석은 0x44이다.</p>
<p>4. SIB의 경우 RBP / [RCX * 4]의 조합을 갖는 녀석은 0x8D이다.</p>
<p>5. Displacement는 보이는 것 처럼 0x8이다.</p>
<p>6. Immediate는 존재하지 않는다.</p>
<p><br></p>
<p>따라서 저 Instruction은 0x48 0x33 0x44 0x8D 0x08와 같이 번역될 것이다.</p>
<p>

![](https://cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/8ee157b917811d86987906546bdaba6c.png)

</p>
<p><br></p>
<p>이 외에도 많은 예시가 있겠지만, 직접 해보면서 알아보도록 하자.</p>
<p><br></p>
<p>nasm, gas, masm 등으로 컴파일 후 나온 object 파일을 objdump로 뜯어보면 된다.</p>
<p>윈도우와 같이 어려운 상황이면 (<a>https://godbolt.org/</a>)를 이용하자.</p>
<p>Assembly로 맞추고 Output에서 Link to binary를 클릭하면 바이트 코드가 나온다.</p>
<p>또한 컴파일 옵션에 (nasm 기준) -f elf32, -f elf64 등으로 32, 64bit 조절이 가능하다.</p>
<p><br></p>
<h2>최종</h2>
<p>이로써 어셈블리 <-> Binary를 알아보았다.</p>
<p><br></p>
<p>어셈블리를 처음 배울 때 들었던 말이 있었다.</p>
<p>"어셈블리에선 Func(memory, memory)는 불가능하다"</p>
<p><br></p>
<p>이 이유가 이 바이트 코드 변환에서 나오는 것이다.</p>
<p><br></p>
<p>또한, 모든 한줄의 Instruction이 그대로 Bytecode로 변환되어 들어가는 것을 보이는데,</p>
<p>이 이유에서 어셈블리와 기계어가 1:1 대응을 한다는 것이다.</p>
<p><br></p>
<p>가령 어셈블리를 기계어로 변환이 가능하고, 기계어도 바로 어셈블리로 변환할 수 있다.</p>
<p><br></p>
<p>아쉬운 것은 AVX에 관해서 위에 사이트 처럼 잘 정리된 곳이 없다.</p>
<p>그래서 이는 인텔 문서를 보고 따로 정리해야한다.</p>
