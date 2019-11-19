const actionIcon = (props) => {
  const template = `
        <i class="${props.class}" name=${props.name}
        onclick="a.handleClick(event,${props.onClick})"></i>`;

  return template;
};

window.a = {
  handleClick: (event, callBack) => {
    callBack(event.target);
  },
};

export default actionIcon;
