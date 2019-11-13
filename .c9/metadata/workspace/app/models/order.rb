{"filter":false,"title":"order.rb","tooltip":"/app/models/order.rb","undoManager":{"mark":27,"position":27,"stack":[[{"start":{"row":4,"column":61},"end":{"row":5,"column":0},"action":"insert","lines":["",""],"id":19},{"start":{"row":5,"column":0},"end":{"row":5,"column":2},"action":"insert","lines":["  "]}],[{"start":{"row":5,"column":0},"end":{"row":5,"column":2},"action":"remove","lines":["  "],"id":20}],[{"start":{"row":5,"column":0},"end":{"row":6,"column":59},"action":"insert","lines":["\tbelongs_to :address, :foreign_key => 'payment_address_id'","\tbelongs_to :address, :foreign_key => 'delivery_address_id'"],"id":21}],[{"start":{"row":5,"column":15},"end":{"row":5,"column":16},"action":"remove","lines":["d"],"id":22}],[{"start":{"row":5,"column":19},"end":{"row":5,"column":20},"action":"insert","lines":["e"],"id":23}],[{"start":{"row":5,"column":20},"end":{"row":5,"column":21},"action":"insert","lines":["s"],"id":24}],[{"start":{"row":6,"column":15},"end":{"row":6,"column":16},"action":"remove","lines":["d"],"id":25}],[{"start":{"row":6,"column":19},"end":{"row":6,"column":20},"action":"insert","lines":["e"],"id":26}],[{"start":{"row":6,"column":20},"end":{"row":6,"column":21},"action":"insert","lines":["s"],"id":27}],[{"start":{"row":6,"column":20},"end":{"row":6,"column":21},"action":"remove","lines":["s"],"id":28}],[{"start":{"row":5,"column":20},"end":{"row":5,"column":21},"action":"remove","lines":["s"],"id":29}],[{"start":{"row":5,"column":13},"end":{"row":5,"column":20},"action":"remove","lines":["adresse"],"id":30},{"start":{"row":5,"column":13},"end":{"row":5,"column":24},"action":"insert","lines":["Useradresse"]}],[{"start":{"row":6,"column":13},"end":{"row":6,"column":20},"action":"remove","lines":["adresse"],"id":31},{"start":{"row":6,"column":13},"end":{"row":6,"column":24},"action":"insert","lines":["Useradresse"]}],[{"start":{"row":5,"column":13},"end":{"row":5,"column":14},"action":"remove","lines":["U"],"id":32}],[{"start":{"row":5,"column":13},"end":{"row":5,"column":14},"action":"insert","lines":["u"],"id":33}],[{"start":{"row":6,"column":13},"end":{"row":6,"column":14},"action":"remove","lines":["U"],"id":34}],[{"start":{"row":6,"column":13},"end":{"row":6,"column":14},"action":"insert","lines":["u"],"id":35}],[{"start":{"row":5,"column":0},"end":{"row":6,"column":63},"action":"remove","lines":["\tbelongs_to :useradresse, :foreign_key => 'payment_address_id'","\tbelongs_to :useradresse, :foreign_key => 'delivery_address_id'"],"id":36}],[{"start":{"row":4,"column":61},"end":{"row":5,"column":0},"action":"remove","lines":["",""],"id":37}],[{"start":{"row":2,"column":18},"end":{"row":3,"column":0},"action":"insert","lines":["",""],"id":38},{"start":{"row":3,"column":0},"end":{"row":3,"column":2},"action":"insert","lines":["  "]}],[{"start":{"row":3,"column":0},"end":{"row":3,"column":2},"action":"remove","lines":["  "],"id":39}],[{"start":{"row":3,"column":0},"end":{"row":4,"column":63},"action":"insert","lines":["\tbelongs_to :useradresse, :foreign_key => 'payment_address_id'","\tbelongs_to :useradresse, :foreign_key => 'delivery_address_id'"],"id":40}],[{"start":{"row":7,"column":29},"end":{"row":8,"column":0},"action":"insert","lines":["",""],"id":41},{"start":{"row":8,"column":0},"end":{"row":8,"column":2},"action":"insert","lines":["  "]}],[{"start":{"row":8,"column":0},"end":{"row":8,"column":2},"action":"remove","lines":["  "],"id":42}],[{"start":{"row":8,"column":0},"end":{"row":9,"column":79},"action":"insert","lines":["  validates_presence_of :billing_address, :on => :create, :message => \"needed\"","  validates_presence_of :shipping_address, :on => :create, :message => \"needed\""],"id":43}],[{"start":{"row":8,"column":25},"end":{"row":8,"column":40},"action":"remove","lines":["billing_address"],"id":44},{"start":{"row":8,"column":25},"end":{"row":8,"column":43},"action":"insert","lines":["payment_address_id"]}],[{"start":{"row":8,"column":0},"end":{"row":9,"column":79},"action":"remove","lines":["  validates_presence_of :payment_address_id, :on => :create, :message => \"needed\"","  validates_presence_of :shipping_address, :on => :create, :message => \"needed\""],"id":45}],[{"start":{"row":8,"column":0},"end":{"row":9,"column":2},"action":"remove","lines":["","  "],"id":46}]]},"ace":{"folds":[],"scrolltop":0,"scrollleft":0,"selection":{"start":{"row":14,"column":8},"end":{"row":14,"column":79},"isBackwards":true},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1541975101643,"hash":"a07df210c2ff2dc54879f0a763c06b413751e4f0"}