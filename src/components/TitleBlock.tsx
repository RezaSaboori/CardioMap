import React, { useState, useEffect } from 'react';

const TitleBlock: React.FC = () => {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  
  const logos = [
    { src: "/NCIBB.svg", alt: "بانک ملی قلب و عروق" },
    { src: "/RNHI.svg", alt: "انستیتو قلب و عروق شهید رجایی" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogoIndex((prevIndex) => (prevIndex + 1) % logos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [logos.length]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'right',
        alignItems: 'center',
        width: '100%',
        marginBottom: '8rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xl)',
          direction: 'rtl',
        }}
      >
        <div
          style={{
            width: 'calc(var(--font-size-2xl) * 4.9)',
            height: 'calc(var(--font-size-2xl) * 4.9)',
            borderRadius: 'var(--border-radius-item-xl)',
            background: 'var(--color-gray2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            overflow: 'hidden',
            position: 'relative',
            top: '5px',
          }}
        >
          <img
            key={currentLogoIndex} 
            src={logos[currentLogoIndex].src}
            alt={logos[currentLogoIndex].alt}
            className="logo-animation"
            style={{
              width: '60%',
              height: '60%',
              objectFit: 'contain',
            }}
          />
        </div>

        <div
          style={{
            fontFamily: 'var(--font-family-persian)',
            color: 'var(--color-gray11)',
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-medium)',
            lineHeight: '1.7',
            direction: 'rtl',
            textAlign: 'right',
          }}
        >
          <div style={{fontWeight: 'var(--font-weight-heavy)', fontSize: 'var(--font-size-3xl)', paddingBottom: '5px'}}>سلام</div>
          <div>به داشبورد مدیریتی</div>
          <div>کاردیومپ خوش آمدید.</div>
        </div>
      </div>
    </div>
  );
};

export default TitleBlock; 