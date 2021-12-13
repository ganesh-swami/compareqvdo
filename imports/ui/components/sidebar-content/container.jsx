import React from 'react';
import SidebarContent from './component';
import { LayoutContextFunc } from '../layout/context';
// import UserListSerive from '../user-list/service';

const SidebarContentContainer = (props) => {
  const { layoutContextState, layoutContextDispatch } = props;
  const {
    output, input,
  } = layoutContextState;
  const { sidebarContent: sidebarContentInput } = input;
  const { sidebarContentPanel } = sidebarContentInput;
  const { sidebarContent } = output;

  if (sidebarContent.display === false) return null;

  return (
    <SidebarContent
      {...sidebarContent}
      layoutContextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
    />
  );
};

export default LayoutContextFunc.withConsumer(SidebarContentContainer);
