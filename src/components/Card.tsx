import React from 'react';
import { Card as MuiCard, CardProps, Box, Typography } from '@mui/material';

interface ICardProps extends CardProps {
  title?: string;
}

const Card: React.FC<ICardProps> = ({ title, children, ...props }) => {
  return (
    <MuiCard
      {...props}
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        ...props.sx,
      }}
    >
      {title && (
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ color: (theme) => theme.palette.primary.dark }}
        >
          {title}
        </Typography>
      )}
      <Box>{children}</Box>
    </MuiCard>
  );
};

export default Card;