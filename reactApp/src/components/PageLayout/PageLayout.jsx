import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { StyledMain } from './Layout.styles';

export const PageLayout = ({ children }) => {
  return (
    <>
      <Header />
      <StyledMain>{children}</StyledMain>
      <Footer />
    </>
  );
};
