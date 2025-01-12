import React, { ReactNode } from 'react';

const colorClasses = {
  red: {
    base: 'bg-red-500/60 border-red-500 hover:bg-red-500',
    dark: 'dark:bg-red-500/30 dark:border-red-500 dark:hover:bg-red-500',
  },
  blue: {
    base: 'bg-blue-500/60 border-blue-500 hover:bg-blue-500',
    dark: 'dark:bg-blue-500/30 dark:border-blue-500 dark:hover:bg-blue-500',
  },
  green: {
    base: 'bg-green-500/60 border-green-500 hover:bg-green-500',
    dark: 'dark:bg-green-500/30 dark:border-green-500 dark:hover:bg-green-500',
  },
  yellow: {
    base: 'bg-yellow-500/60 border-yellow-500 hover:bg-yellow-500',
    dark: 'dark:bg-yellow-500/30 dark:border-yellow-500 dark:hover:bg-yellow-500',
  },
  purple: {
    base: 'bg-purple-500/60 border-purple-500 hover:bg-purple-500',
    dark: 'dark:bg-purple-500/30 dark:border-purple-500 dark:hover:bg-purple-500',
  },
  pink: {
    base: 'bg-pink-500/60 border-pink-500 hover:bg-pink-500',
    dark: 'dark:bg-pink-500/30 dark:border-pink-500 dark:hover:bg-pink-500',
  },
  indigo: {
    base: 'bg-indigo-500/60 border-indigo-500 hover:bg-indigo-500',
    dark: 'dark:bg-indigo-500/30 dark:border-indigo-500 dark:hover:bg-indigo-500',
  },
  gray: {
    base: 'bg-gray-500/60 border-gray-500 hover:bg-gray-500',
    dark: 'dark:bg-gray-500/30 dark:border-gray-500 dark:hover:bg-gray-500',
  },
  black: {
    base: 'bg-black/60 border-black hover:bg-black',
    dark: 'dark:bg-black/30 dark:border-black dark:hover:bg-black',
  },
  white: {
    base: 'bg-white/60 border-white hover:bg-white',
    dark: 'dark:bg-white/30 dark:border-white dark:hover:bg-white',
  },
  zinc: {
    base: 'bg-zinc-500/20 border-zinc-500 hover:bg-zinc-500',
    dark: 'dark:bg-zinc-500/30 dark:border-zinc-500 dark:hover:bg-zinc-500',
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
      className={className ? className : `w-full ${selectedColor.base} ${selectedColor.dark} border rounded-md px-4 py-2 flex items-center justify-center space-x-1 duration-300 cursor-pointer`}
      onClick={onClick}
      type={type}
    >
      <div className="flex items-center justify-center space-x-2">
        {icon && icon}
        {text && <h1 className="text-text font-bold whitespace-nowrap">{text}</h1>}
      </div>
    </button>
  );
};

export default Button;
