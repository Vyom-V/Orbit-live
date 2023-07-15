function newStatsUi(){
    return `<div class="container" id="containerId">
    <h1>ORBITTER</h1>
    <h3 id="userPoints"></h3>
    <div id="menu">
          <div onclick="closeUi()" id="statsCloseBtn">&times;</div>
          <ul class="list">
              <li class='menuItem' id="speed" onclick="upgrade(this)">
                  <span>Speed <i>1pt</i></span>
              </li>
              <li class='menuItem' id="dmgPerShoot" onclick="upgrade(this)">
                  <span>Damage <i>1pt</i></span>
              </li>
              <li class='menuItem' id="defense" onclick="upgrade(this)">
                  <span>Defense <i>1pt</i></span>
              </li>
              <li class='menuItem' id="maxHp" onclick="upgrade(this)">
                <span>HP <i>1pt</i></span>
              </li>
              <li class='menuItem' id="rocketPerShoot" onclick="upgrade(this)">
                  <span>Rockets <i>2pt</i></span>
              </li>
          </ul>
      </div>
  </div>`;
}