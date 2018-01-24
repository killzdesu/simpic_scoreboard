class Team{
  constructor(name){
    this.name = name;
    this.score = 0;
  }
  setName(name){
    this.name = name;
  }
}

var teams = [];
teams.push(new Team('MWIT'));
teams.push(new Team('SCORE'));
teams.push(new Team('HI'));
teams.push(new Team('FY'));

function addAllUsers(user){
  teams.forEach(team => {
    user['team.name'] = team;
  });
  return user;
}


export {teams, Team, addAllUsers};