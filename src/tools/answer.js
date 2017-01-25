
import React from 'react';
import EpicComponent from 'epic-component';
import {Button} from 'react-bootstrap';

export default EpicComponent(self => {

  self.render = function () {
    const {submitAnswer, onSubmitAnswer, onDismissAnswerFeedback, SaveButton, score} = self.props;
    return (
      <div className="taskHeader">
        <div className="submitBlock">
          <Button onClick={onSubmitAnswer} disabled={submitAnswer && submitAnswer.status === 'pending'}>
            {"soumettre le texte déchiffré"}
          </Button>
        </div>
        {submitAnswer.feedback !== undefined &&
          <div className="feedbackBlock" onClick={onDismissAnswerFeedback}>
            {submitAnswer.feedback === 0 &&
              <span>
                <i className="fa fa-check" style={{color: 'green'}}/>
                {" Votre réponse est exacte."}
              </span>}
            {submitAnswer.feedback > 0 &&
              <span>
                <i className="fa fa-check" style={{color: 'orange'}}/>
                {" Votre réponse contient "}{submitAnswer.feedback}{" erreurs."}
              </span>}
            {submitAnswer.feedback === false &&
              <span>
                <i className="fa fa-close" style={{color: 'red'}}/>
                {" Votre réponse est incorrecte."}
              </span>}
          </div>}
        <div className="scoreBlock">
          {"Score : "}{score === undefined ? '-' : score}
        </div>
        <div className="saveBlock">
          <SaveButton/>
        </div>
      </div>
    );
  };

});
