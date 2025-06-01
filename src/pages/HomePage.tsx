import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import Button from '../components/Button';
import Header from '../components/Header';
import logo from '../assets/images/logo-devinsight.png';

const HomePage: React.FC = () => {
  return (
    <>
      <Header />
      <Container maxWidth="lg">
        <Box my={4} textAlign="center">
          <Typography variant="h3" gutterBottom>
            Bem-vindo ao DevInsight
          </Typography>

          {/* Container para o logo com tamanho controlado */}
          <Box 
            component="img"
            src={logo}
            alt="Logo DevInsight"
            sx={{
              maxWidth: '200px', // Largura máxima
              width: '100%',    // Responsivo
              height: 'auto',   // Mantém proporção
              margin: '20px auto', // Centraliza com margem
              display: 'block', // Garante o alinhamento
            }}
          />

          <Typography variant="subtitle1" paragraph>
            Plataforma para Consultoria em Desenvolvimento de Sistemas.
          </Typography>
          <Typography variant="subtitle1" paragraph>
            Sistema web voltado à automação da consultoria em desenvolvimento de sistemas, cobrindo todas as etapas:<br />
            - Diagnóstico<br />
            - Proposta<br />
            - Roadmap<br />
            - Validação e<br />
            - Entrega.<br />
          </Typography>
          <Box mt={4}>
            <Button href="/login">Entrar</Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;