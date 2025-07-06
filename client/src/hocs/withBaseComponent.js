import React from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const withBaseComponent = (Component) => {
  function Wrapper(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    return (
      <Component
        {...props}
        navigate={navigate}
        dispatch={dispatch}
        location={location}
      />
    );
  }

  Wrapper.displayName = `withBaseComponent(${
    Component.displayName || Component.name || "Component"
  })`;

  return Wrapper;
};

export default withBaseComponent;
