export function Hero() {
  return (
    <header className="hero">
      <div className="hero-kicker">
        <span aria-hidden="true" className="hero-kicker-line" />
        Trưa nay, chốt nhanh
      </div>
      <h1>
        Hôm nay
        <span>ăn gì?</span>
      </h1>
      <p className="hero-copy">
        Một cú quay cho bữa trưa quanh 219 Trung Kính — bớt phân vân,
        thêm thời gian để ăn ngon.
      </p>
      <a className="hero-jump" href="#quay-trua">
        Tìm món trưa
        <span aria-hidden="true">↓</span>
      </a>
    </header>
  );
}
