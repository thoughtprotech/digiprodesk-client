import React, { ReactNode } from 'react';

const colorClasses = {
  red: {
    base: 'bg-red-500/30 border-red-500 hover:bg-red-500',
  },
  blue: {
    base: 'bg-blue-500/30 border-blue-500 hover:bg-blue-500',
  },
  green: {
    base: 'bg-green-500/30 border-green-500 hover:bg-green-500',
  },
  yellow: {
    base: 'bg-yellow-500/30 border-yellow-500 hover:bg-yellow-500',
  },
  purple: {
    base: 'bg-purple-500/30 border-purple-500 hover:bg-purple-500',
  },
  pink: {
    base: 'bg-pink-500/30 border-pink-500 hover:bg-pink-500',
  },
  indigo: {
    base: 'bg-indigo-500/30 border-indigo-500 hover:bg-indigo-500',
  },
  gray: {
    base: 'bg-gray-500/30 border-gray-500 hover:bg-gray-500',
  },
  black: {
    base: 'bg-black/30 border-black hover:bg-black',
  },
  white: {
    base: 'bg-white/30 border-white hover:bg-white',
  },
  zinc: {
    base: 'bg-zinc-500/30 border-zinc-500 hover:bg-zinc-500',
  },
  foreground: {
    base: 'bg-background border-border hover:bg-border',
  },
  // Add more colors as needed
};


interface ButtonProps {
  text?: string;
  color?: keyof typeof colorClasses | null;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  text,
  color = 'blue', // Default color
  icon,
  className,
  onClick,
  type = 'button',
}) => {
  const selectedColor = colorClasses[color!] || colorClasses.blue;

  return (
    <button
      className={className ? className : `w-full max-w-48 ${selectedColor.base} border-2 rounded-md px-2 py-1 flex items-center justify-center space-x-1 duration-300 cursor-pointer`}
      onClick={onClick}
      type={type}
    >
      <div className="flex items-center justify-center space-x-2">
        {icon && icon}
        {text && <h1 className="text-text font-bold text-sm whitespace-nowrap">{text}</h1>}
      </div>
    </button>
  );
};

export default Button;
