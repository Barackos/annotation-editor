import "./Painter.scss";
import React, { useState } from 'react';
import { Button } from "@material-ui/core";

class OurPainter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
    }
  }

  render() {
    const { imgUrl } = this.props;
    const onClick = () => {
      const ctx = this.ctx;
      ctx.lineWidth = 10;

      ctx.fillRect(0, 0, 150, 150);   // Draw a rectangle with default settings
      ctx.save();                  // Save the default state
    
      ctx.fillStyle = '#09F';      // Make changes to the settings
      ctx.fillRect(15, 15, 120, 120); // Draw a rectangle with new settings

      ctx.save();                  // Save the current state
      ctx.fillStyle = '#FFF';      // Make changes to the settings
      ctx.globalAlpha = 0.5; 
      ctx.fillRect(30, 30, 90, 90);   // Draw a rectangle with new settings
      ctx.restore();
    }
    return (
      <div className="canvasContainer">
        <div className="painterFixed">
          <img src={imgUrl} alt="" width="500px" />
          <canvas id="stam" ref={(c) => this.ctx = c.getContext('2d')} width="500px" onClick={onClick} />
        </div>
      </div>
    );
  }
}
  

export default OurPainter;
