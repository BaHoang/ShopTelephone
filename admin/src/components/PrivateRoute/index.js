import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, ...rest }) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    return <Route {...rest} render={() => (isAuthenticated ? children : <Redirect to='/login' />)} />;
};

export default PrivateRoute;
