const Events = require('./Events');

function initRaycaster (inspector) {
  // Use cursor="rayOrigin: mouse".
  const mouseCursor = document.createElement('a-entity');
  mouseCursor.setAttribute('id', 'aframeInspectorMouseCursor');
  mouseCursor.setAttribute('cursor', 'rayOrigin', 'mouse');
  mouseCursor.setAttribute('raycaster', {
    interval: 100, objects: 'a-scene :not([data-aframe-inspector])'
  });
  inspector.sceneEl.appendChild(mouseCursor);

  mouseCursor.addEventListener('click', handleClick);
  inspector.container.addEventListener('mousedown', onMouseDown);
  inspector.container.addEventListener('mouseup', onMouseUp);
  inspector.container.addEventListener('dblclick', onDoubleClick);

  const onDownPosition = new THREE.Vector2();
  const onUpPosition = new THREE.Vector2();
  const onDoubleClickPosition = new THREE.Vector2();

  function handleClick (evt) {
    // Check to make sure not dragging.
    const DRAG_THRESHOLD = 0.03;
    if (onDownPosition.distanceTo(onUpPosition) >= DRAG_THRESHOLD) { return; }
    inspector.selectEntity(evt.detail.intersectedEl);
  }

  function onMouseDown (event) {
    if (event instanceof CustomEvent) { return; }
    event.preventDefault();
    const array = getMousePosition(inspector.container, event.clientX, event.clientY);
    onDownPosition.fromArray(array);
  }

  function onMouseUp (event) {
    if (event instanceof CustomEvent) { return; }
    event.preventDefault();
    const array = getMousePosition(inspector.container, event.clientX, event.clientY);
    onUpPosition.fromArray(array);
  }

  function onTouchStart (event) {
    const touch = event.changedTouches[0];
    const array = getMousePosition(inspector.container, touch.clientX, touch.clientY);
    onDownPosition.fromArray(array);
  }

  function onTouchEnd (event) {
    const touch = event.changedTouches[0];
    const array = getMousePosition(inspector.container, touch.clientX, touch.clientY);
    onUpPosition.fromArray(array);
  }

  /**
   * Focus on double click.
   */
  function onDoubleClick (event) {
    const array = getMousePosition(inspector.container, event.clientX, event.clientY);
    onDoubleClickPosition.fromArray(array);
    intersectedEl = mouseCursor.components.cursor.intersectedEl;
    if (!intersectedEl) { return; }
    Events.emit('objectfocus', intersectedEl.object3D);
  }

  return {
    el: mouseCursor,
    enable: () => {
      mouseCursor.setAttribute('raycaster', 'enabled', true);
    },
    disable: () => {
      mouseCursor.setAttribute('raycaster', 'enabled', false);
    }
  };
}
module.exports.initRaycaster = initRaycaster;

function getMousePosition (dom, x, y) {
  const rect = dom.getBoundingClientRect();
  return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
}