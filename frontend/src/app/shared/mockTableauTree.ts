export default {
    nodes: [
        {id: 1, head: '(every man)(be work)', sign: true},
        {id: 2, head: '(every ((who (be work)) person))(λF.((a (expensive car))(λE.((have E) F))))', sign: true},
        {id: 3, head: '(every man)(λM.((a car)(λE.((own E) M))))', sign: false},
        {id: 4, head: 'be work', args: 'c1', rule: 'up_mon_fun_some([c1],[1,3])', sign: true},
        {id: 5, head: 'λM.((a car)(λE.((own E) M)))', args: 'c1', rule: 'up_mon_fun_some([c1],[1,3])', sign: false},
        {id: 6, head: 'man', args: 'c1', rule: 'up_mon_fun_some([c1],[1,3])', sign: true},
        {id: 7, head: '(a car)(λE.((own E) c1))', rule: 'pull_arg([5])', sign: false},
        {id: 8, head: 'work', args: 'c1', rule: 'empty_mod([4])', sign: true},
    ],
    subtrees: [
        {
            nodes: [
                {id: 9, head: '(who (be work)) person', args: 'c1', rule: 'tr_every([2],[c1])', sign: false},
            ],
            subtrees: [
                {
                    nodes: [
                        {id: 12, head: 'be work', args: 'c1', rule: 'fl_conj_who([9])', sign: false},
                        {id: 15, head: 'work', args: 'c1', rule: 'empty_mod([12])', sign: false},
                        {end: true, rule: 'cl_subsumption([15, 8])'}
                    ],
                },
                {
                    nodes: [
                        {id: 13, head: 'person', args: 'c1', rule: 'fl_conj_who([9])', sign: false},
                        {end: true, rule: 'cl_subsumption([13, 6])'}
                    ]
                }
            ]
        },
        {
            nodes: [
                {id: 10, head: '(who (be work)) person', args: 'c1', rule: 'tr_every([2],[c1])', sign: true},
                {id: 11, head: 'λF.((a (expensive car))(λE.((have E) F)))', args: 'c1', rule: 'tr_every([2],[c1])', sign: true},
                {id: 14, head: '(a (expensive car))(λE.((have E) c1))', rule: 'pull_arg([11])', sign: true},
                {id: 16, head: 'be work', args: 'c1', rule: 'tr_conj_who([10])', sign: true},
                {id: 17, head: 'person', args: 'c1', rule: 'tr_conj_who([10])' , sign: true},
                {id: 8, head: 'work', args: 'c1', rule: 'empty_mod([16])', sign: true},
                {id: 18, head: 'a (expensive car)', args: 'λE.((have E) c1)', rule: 'same_args_tf([14,7])', sign: true},
                {id: 19, head: 'a car', args: 'λE.((have E) c1)', rule: 'same_args_tf([14,7])', sign: false},
                {id: 20, head: 'expensive car', args: 'c2', rule: 'up_mon_fun([c2],[18,19])', sign: true},
                {id: 21, head: 'car', args: 'c2', rule: 'up_mon_fun([c2],[18,19])', sign: false},
                {id: 22, head: 'car', args: 'c2', rule: 'int_mod_tr([20])', sign: true},
                {id: 23, head: 'expensive', args: 'c2', rule: 'int_mod_tr([20])', sign: true},
                {end: true, rule: 'cl_subsumption([22, 21])'}
            ]
        }
    ]
};
