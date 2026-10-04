import { useState } from 'react';
import { Button, type ButtonProps } from '@mui/material';
import { SupportDialog } from './SupportDialog';
import type { SupportCategory } from './supportApi';

export function SupportButton({
  initialCategory,
  children = 'Contact Support',
  ...props
}: Omit<ButtonProps, 'onClick'> & { initialCategory?: SupportCategory }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" {...props} onClick={() => setOpen(true)}>
        {children}
      </Button>
      {open && (
        <SupportDialog open onClose={() => setOpen(false)} initialCategory={initialCategory} />
      )}
    </>
  );
}
