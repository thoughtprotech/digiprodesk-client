import { ReactNode, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import useOutsideClick from '@/hooks/useOutsideClick';

interface DropdownItem {
  id: string;
  name: string;
  icon?: ReactNode;
}

interface DropdownProps {
  id: string;
  title?: ReactNode;
  data: DropdownItem[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  hasImage?: boolean;
  style?: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

const Dropdown = ({
  id,
  title = 'Select',
  data,
  position = 'bottom-left',
  hasImage,
  selectedId,
  onSelect,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [, setSelectedItem] = useState<DropdownItem | undefined>(
    selectedId ? data?.find((item) => item.id === selectedId) : undefined
  );

  const handleChange = (item: DropdownItem) => {
    setSelectedItem(item);
    if (onSelect) {
      onSelect(item.id);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (selectedId && data) {
      const newSelectedItem = data.find((item) => item.id === selectedId);
      if (newSelectedItem) {
        setSelectedItem(newSelectedItem);
      }
    } else {
      setSelectedItem(undefined);
    }
  }, [selectedId, data]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOutsideClick({
    ref: dropdownRef,
    handler: () => setIsOpen(false),
  });

  const dropdownClass = classNames(
    'absolute bg-background w-max max-h-64 overflow-y-auto rounded shadow-md z-10',
    {
      'top-full right-0 mt-2': position === 'bottom-right',
      'top-full left-0 mt-2': position === 'bottom-left',
      'bottom-full right-0 mb-2': position === 'top-right',
      'bottom-full left-0 mb-2': position === 'top-left',
    }
  );

  return (
    <div ref={dropdownRef} className='relative'>
      <button
        id={id}
        aria-label='Toggle dropdown'
        aria-haspopup='true'
        aria-expanded={isOpen}
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-center'
      >
        <span>{title}</span>
      </button>
      {/* Open */}
      {isOpen && (
        <div aria-label='Dropdown menu' className={dropdownClass}>
          <ul
            role='menu'
            aria-labelledby={id}
            aria-orientation='vertical'
          >
            {data?.map((item, index) => (
              <li
                key={item.id}
                onClick={() => handleChange(item)}
                className={
                  `flex items-center hover:bg-foreground duration-300 cursor-pointer space-x-1 p-2 ${index === data.length - 1 ? '' : 'border-b border-border'
                  }`
                }
              >
                {hasImage && (
                  <>
                    {item.icon}
                  </>
                )}
                <span className='text-sm'>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;