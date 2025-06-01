import React from 'react';
import Card from './Card';
import { Box, Typography } from '@mui/material';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon }) => {
  return (
    <Card
      sx={{
        textAlign: 'center',
        backgroundColor: '#A4D2F4',
        flex: 1,
        minWidth: '200px',
        p: 3
      }}
    >
      {icon && (
        <Box mb={1}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4">
        {value}
      </Typography>
    </Card>
  );
};

export default SummaryCard;