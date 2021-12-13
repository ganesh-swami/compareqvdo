import React from 'react';
import { LayoutContextFunc } from '../layout/context';
import SidebarNavigation from './component';

const SidebarNavigationContainer = (props) => {
  const { layoutContextState, layoutContextDispatch, openPanel } = props;
  const { output } = layoutContextState;
  const { sidebarNavigation } = output;
  console.log('sidebarNavigation.display, openPanel ',sidebarNavigation.display,openPanel);
  if (sidebarNavigation.display === false) return null;

  return (
    <SidebarNavigation
      {...sidebarNavigation}
      openPanel={openPanel}
      contextDispatch={layoutContextDispatch}
    />
  );
};

export default LayoutContextFunc.withConsumer(SidebarNavigationContainer);
