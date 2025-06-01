import React from 'react';
import { Button as MuiButton, ButtonProps } from '@mui/material';

interface IButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const Button: React.FC<IButtonProps> = ({ children, ...props }) => {
  return (
    <MuiButton 
      variant="contained" 
      color="primary"
      disableElevation // Remove sombra padrão
      {...props}
      sx={{
        '&:hover': {
          backgroundColor: (theme) => theme.palette.primary.dark,
        },
        ...props.sx,
      }}
    >
      {children}
    </MuiButton>
  );
};

export default Button;