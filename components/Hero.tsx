export function Hero() {
  return (
    <header className="hero">
      <div className="hero-kicker">
        <span aria-hidden="true" className="hero-kicker-line" />
        219 Trung Kính · Ăn trưa
      </div>
      <h1>
        Vnexter
        <span>ăn gì?</span>
      </h1>
      <p className="hero-copy">
        Chọn nhanh quán ăn trưa quanh văn phòng — một cú quay, bớt phân vân,
        thêm thời gian để ăn ngon.
      </p>
      <a className="hero-jump" href="#quay-trua">
        Tìm món trưa
        <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
