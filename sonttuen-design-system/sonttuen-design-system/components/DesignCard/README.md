# DesignCard

인형 디자인 하나(강아지·고양이·토끼·곰 등)를 보여주는 카드로, 이미지 + 이름 + 레드 화살표로 구성됩니다.

- 바탕 `surface-card`, 1px `line` 테두리, 모서리 `radius-md`, 안쪽 여백 `space-3`.
- 이미지는 Placeholder(동물별 색), 이름 `title-card`.
- 4장씩 `space-5` 간격으로 가로 배열하고, 아래에 Progress 바를 둡니다.
- 카드 전체가 눌리게 만들어도 되지만, 화살표 버튼의 `aria-label`은 유지합니다.
