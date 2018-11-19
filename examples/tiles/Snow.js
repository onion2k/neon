import React from "react";
import Tile from "../Tile.js";
import withNeon, { fx } from "../../src/index.js";

class SnowTile extends React.Component {
  render(){
    return (
      <Tile bgIm="https://source.unsplash.com/random?snow" />
    )
  }
};

const snowConfig = { fullscreen: true, type: "snow" };
const effect = new fx.Snow(snowConfig);

export default withNeon(SnowTile, effect);
