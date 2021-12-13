
import React from 'react';
import { styles } from './styles';

const CustomLogo = props => (
  <div>
    <div className={styles.branding}>
      <img src={props.CustomLogoUrl} alt="qvdo" />
    </div>
    {props.separator ? 
    <div className={styles.separator} />
    : null }
  </div>
);

export default CustomLogo;
