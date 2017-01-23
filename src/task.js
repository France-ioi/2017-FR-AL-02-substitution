import React from 'react';
import EpicComponent from 'epic-component';

/*const assetUrl = function (name) {
   return require(`./assets/${name}`);
};*/

const Task = EpicComponent(self => {

   self.render = function () {
      const {task} = self.props;
      return (
         <div>
            <p>{"Task text here."}</p>
         </div>
      );
   };

});

export default Task;
