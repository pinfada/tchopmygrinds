{"filter":false,"title":"useradresses_controller.rb","tooltip":"/app/controllers/useradresses_controller.rb","undoManager":{"mark":32,"position":32,"stack":[[{"start":{"row":0,"column":52},"end":{"row":1,"column":0},"action":"insert","lines":["",""],"id":2},{"start":{"row":1,"column":0},"end":{"row":1,"column":2},"action":"insert","lines":["  "]}],[{"start":{"row":1,"column":2},"end":{"row":1,"column":20},"action":"insert","lines":["authorize_resource"],"id":3}],[{"start":{"row":1,"column":20},"end":{"row":1,"column":21},"action":"insert","lines":["."],"id":4}],[{"start":{"row":1,"column":20},"end":{"row":1,"column":21},"action":"remove","lines":["."],"id":5}],[{"start":{"row":1,"column":20},"end":{"row":2,"column":0},"action":"insert","lines":["",""],"id":6},{"start":{"row":2,"column":0},"end":{"row":2,"column":2},"action":"insert","lines":["  "]}],[{"start":{"row":2,"column":2},"end":{"row":2,"column":25},"action":"insert","lines":["before_action :set_user"],"id":7}],[{"start":{"row":65,"column":9},"end":{"row":66,"column":0},"action":"insert","lines":["",""],"id":8},{"start":{"row":66,"column":0},"end":{"row":66,"column":2},"action":"insert","lines":["  "]}],[{"start":{"row":66,"column":0},"end":{"row":66,"column":2},"action":"remove","lines":["  "],"id":9}],[{"start":{"row":66,"column":0},"end":{"row":67,"column":0},"action":"insert","lines":["",""],"id":10}],[{"start":{"row":67,"column":0},"end":{"row":69,"column":7},"action":"insert","lines":["    def set_user","      @user = User.find(params[:user_id])","    end"],"id":11}],[{"start":{"row":69,"column":7},"end":{"row":70,"column":0},"action":"insert","lines":["",""],"id":12},{"start":{"row":70,"column":0},"end":{"row":70,"column":4},"action":"insert","lines":["    "]}],[{"start":{"row":8,"column":4},"end":{"row":8,"column":5},"action":"insert","lines":["#"],"id":13}],[{"start":{"row":8,"column":36},"end":{"row":9,"column":0},"action":"insert","lines":["",""],"id":14},{"start":{"row":9,"column":0},"end":{"row":9,"column":4},"action":"insert","lines":["    "]}],[{"start":{"row":9,"column":4},"end":{"row":9,"column":35},"action":"insert","lines":["@useradresses = Useradresse.all"],"id":15}],[{"start":{"row":9,"column":20},"end":{"row":9,"column":35},"action":"remove","lines":["Useradresse.all"],"id":16}],[{"start":{"row":9,"column":20},"end":{"row":9,"column":32},"action":"insert","lines":["@user.orders"],"id":17}],[{"start":{"row":9,"column":26},"end":{"row":9,"column":32},"action":"remove","lines":["orders"],"id":18},{"start":{"row":9,"column":26},"end":{"row":9,"column":38},"action":"insert","lines":["Useradresses"]}],[{"start":{"row":9,"column":26},"end":{"row":9,"column":27},"action":"remove","lines":["U"],"id":19}],[{"start":{"row":9,"column":26},"end":{"row":9,"column":27},"action":"insert","lines":["u"],"id":20}],[{"start":{"row":19,"column":4},"end":{"row":19,"column":5},"action":"insert","lines":["#"],"id":21}],[{"start":{"row":19,"column":34},"end":{"row":20,"column":0},"action":"insert","lines":["",""],"id":22},{"start":{"row":20,"column":0},"end":{"row":20,"column":4},"action":"insert","lines":["    "]}],[{"start":{"row":20,"column":4},"end":{"row":20,"column":33},"action":"insert","lines":["@useradress = Useradresse.new"],"id":23}],[{"start":{"row":20,"column":18},"end":{"row":20,"column":29},"action":"remove","lines":["Useradresse"],"id":24},{"start":{"row":20,"column":18},"end":{"row":20,"column":36},"action":"insert","lines":["@user.useradresses"]}],[{"start":{"row":30,"column":4},"end":{"row":30,"column":5},"action":"insert","lines":["#"],"id":25}],[{"start":{"row":30,"column":53},"end":{"row":31,"column":0},"action":"insert","lines":["",""],"id":26},{"start":{"row":31,"column":0},"end":{"row":31,"column":4},"action":"insert","lines":["    "]}],[{"start":{"row":31,"column":4},"end":{"row":31,"column":52},"action":"insert","lines":["@useradress = Useradresse.new(useradress_params)"],"id":27}],[{"start":{"row":31,"column":18},"end":{"row":31,"column":29},"action":"remove","lines":["Useradresse"],"id":28},{"start":{"row":31,"column":18},"end":{"row":31,"column":36},"action":"insert","lines":["@user.useradresses"]}],[{"start":{"row":31,"column":39},"end":{"row":31,"column":40},"action":"remove","lines":["w"],"id":29}],[{"start":{"row":31,"column":38},"end":{"row":31,"column":39},"action":"remove","lines":["e"],"id":30}],[{"start":{"row":31,"column":37},"end":{"row":31,"column":38},"action":"remove","lines":["n"],"id":31}],[{"start":{"row":31,"column":37},"end":{"row":31,"column":38},"action":"insert","lines":["c"],"id":32}],[{"start":{"row":31,"column":38},"end":{"row":31,"column":39},"action":"insert","lines":["r"],"id":33}],[{"start":{"row":31,"column":37},"end":{"row":31,"column":39},"action":"remove","lines":["cr"],"id":34},{"start":{"row":31,"column":37},"end":{"row":31,"column":43},"action":"insert","lines":["create"]}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":31,"column":43},"end":{"row":31,"column":43},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1541926389251,"hash":"b51e0c60a12dcacc3351e5eb41407b2d56777811"}