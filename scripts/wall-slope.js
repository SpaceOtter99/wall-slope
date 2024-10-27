Hooks.on("init", () => {
  // Extend wall data schema to add a "height" attribute
  CONFIG.Wall.documentClass = class extends CONFIG.Wall.documentClass {
    static defineSchema() {
      const schema = super.defineSchema();
      schema.height = { type: Number, default: 1 };
      return schema;
    }
  };

  // Add "height" attribute to wall configuration UI
  Hooks.on("renderWallConfig", (app, html, data) => {
    const heightInput = `<div class="form-group">
        <label>Height</label>
        <input type="number" name="height" value="${data.object.height || 1}" data-dtype="Number" />
      </div>`;
    html.find('div.form-group').last().after(heightInput);
  });

  // Vision-blocking logic based on cumulative wall height
  Hooks.on("sightRefresh", (sightLayer) => {
    const tokens = canvas.tokens.placeables;
    tokens.forEach(token => {
      const wallsInPath = canvas.walls.placeables.filter(wall => {
        const wallHeight = wall.document.height || 1;
        const path = new PIXI.Polygon(wall.data.c);
        return path.contains(token.x, token.y) && wallHeight;
      });

      // Calculate total height of walls in the path
      const totalHeight = wallsInPath.reduce((sum, wall) => sum + (wall.document.height || 1), 0);
      if (totalHeight > 0) token.visible = false;
      else token.visible = true;
    });
  });
});
