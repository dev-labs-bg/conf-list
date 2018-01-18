import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Wrapper = (props) => {
    console.log(props);
    return (
        <div>
            <Header isAuthenticated={props.auth} />
            {props.children}
            <Footer />
        </div>
    );
}

export default Wrapper;
