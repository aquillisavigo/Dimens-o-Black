
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className, size = 40 }) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <img 
        src="https://www.upload.ee/image/18931113/logo_do_site_e_nossa_logo_png.png" 
        alt="Dimensão Black Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
