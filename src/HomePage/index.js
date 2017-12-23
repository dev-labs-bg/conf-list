import React from 'react';

import Header from '../common/Header';
import Footer from '../common/Footer';

import CardList from '../EventsHandling/CardList/CardList';

const homePage = () => (
    <div>
        <Header />
        <CardList />
        <Footer />
    </div>
);


export default homePage;