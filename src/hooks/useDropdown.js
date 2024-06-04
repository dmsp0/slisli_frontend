import { useState, useEffect } from 'react';

const useDropdown = (ref, initialState) => {
    const [isOpen, setIsOpen] = useState(initialState);

    useEffect(() => {
        const onClick = (e) => {
          if (ref.current && !ref.current.contains(e.target)) {
            setIsOpen(!isOpen);
          }
        };

        if (isOpen) {
          window.addEventListener('click', onClick );
        }
    
        return () => {
          window.removeEventListener('click', onClick );
        };
      }, [isOpen, ref]);
    return [isOpen, setIsOpen];
}

export default useDropdown;