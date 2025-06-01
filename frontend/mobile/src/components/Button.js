import React, { forwardRef } from 'react';
import { Text, TouchableOpacity } from 'react-native';

const Button = forwardRef(({ title, style, textStyle, ...props }, ref) => {
  return (
    <TouchableOpacity
      ref={ref}
      style={[
        { 
          alignItems: 'center', 
          backgroundColor: '#6366f1', 
          borderRadius: 24, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          padding: 16
        }, 
        style
      ]}
      {...props}>
      <Text 
        style={[
          { 
            color: 'white', 
            fontSize: 18, 
            fontWeight: '600', 
            textAlign: 'center'
          }, 
          textStyle
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
});

export default Button; 