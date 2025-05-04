const express = require('express');
const comboMap = require('../data/comboMap');
const universityMajors = require('../data/universities');
const router = express.Router();


//  /api/
router.get('/', (req,res) => {
    res.json({message: 'pong'});
});

router.post('/universities/match', (request,response) => {
    const userScores = request.body.scores;
    console.log(userScores);
    const matchMajors = [];


    const userComboScores = {};
    for (const [combo, subjects] of Object.entries(comboMap)) {
        const score = subjects.reduce((sum, subject) => {
        if (userScores[subject] === undefined) return null;
        return sum + userScores[subject];
        }, 0);

        if (score !== null) {
        userComboScores[combo] = score;
        }
    }

    for (const major of universityMajors) {
        for (const combo of major.acceptedCombinations) {
          const userScore = userComboScores[combo];
          if (userScore !== undefined && userScore >= major.requiredScore) {
            matchMajors.push({
              ...major,
              matchedCombination: combo,
              userScore
            });
            break;
          }
        }
      }

    console.log(matchMajors);


    response.json(matchMajors);
})

module.exports = router;