
import React from 'react';
import EpicComponent from 'epic-component';

import {renderText} from './common_views';

export default EpicComponent(self => {

   self.render = function() {
      const {text} = self.props;
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>
               {"texte chiffré"}
            </div>
            <div className='panel-body'>
               <div className='text-input'>{renderText(text)}</div>
            </div>
         </div>
      );
   };

});
