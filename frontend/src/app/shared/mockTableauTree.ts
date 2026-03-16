export default {
    nodes: [
        {id: 1, head: 'every@man@(be@work)', sign: true},
        {id: 2, head: 'every@(who@(be@work)@person)@(λ1,a@(expensive@car)@(λ2,have@2@1))', sign: true},
        {id: 3, head: 'every@man@(λ3,a@car@(λ2,own@2@3))', sign: false},
        {id: 4, head: 'be@work', args: 'c1', rule: 'up_mon_fun_some[1,3]', sign: true},
        {id: 5, head: '(λ3,a@car@(λ2,own@2@3))', args: 'c1', rule: 'up_mon_fun_some[1,3]', sign: false},
        {id: 6, head: 'man', args: 'c1', rule: 'up_mon_fun_some[1,3]', sign: true},
        {id: 7, head: 'a@car@(λ2,own@2@c1)', rule: 'pull_arg[5]', sign: false},
        {id: 8, head: 'work', args: 'c1', rule: 'aux_verb[4]', sign: true},
        {id: 9, head: 'be@work', args: 'c1', rule: 'tr_every_c[1,6], [c1]', sign: true},
        {id: 8, head: 'work', args: 'c1', rule: 'aux_verb[9]', sign: true},
    ],
    subtrees: [
        {
            nodes: [
                {id: 10, head: 'who@(be@work)@person', args: 'c1', rule: 'tr_every[2],[c1]', sign: false},
            ],
            subtrees: [
                {
                    nodes: [
                        {id: 13, head: 'be@work', args: 'c1', rule: 'fl_conj_who[10]', sign: false},
                        {id: 16, head: 'work', args: 'c1', rule: 'aux_verb[13]', sign: false},
                        {end: true, rule: 'cl_subcat[16,8]'}
                    ],
                },
                {
                    nodes: [
                        {id: 14, head: 'person', args: 'c1', rule: 'fl_conj_who[10]', sign: false},
                        {end: true, rule: 'cl_subsumption[14,6]'}
                    ]
                }
            ]
        },
        {
            nodes: [
                {id: 11, head: 'who@(be@work)@person', args: 'c1', rule: 'tr_every[2],[c1]', sign: true},
                {id: 12, head: '(λ1,a@(expensive@car)@(λ2,have@2@1))', args: 'c1', rule: 'tr_every[2],[c1]', sign: true},
                {id: 15, head: 'a@(expensive@car)@(λ2,have@2@c1)', args: 'c1', rule: 'pull_arg[12]', sign: true},
                {id: 17, head: 'be@work', args: 'c1', rule: 'tr_conj_who[11]', sign: true},
                {id: 18, head: 'person', args: 'c1', rule: 'tr_conj_who[11]' , sign: true},
                {id: 8, head: 'work', args: 'c1', rule: 'aux_verb[17]', sign: true},
                {id: 19, head: 'a@(expensive@car)', args: '(λ2,have@2@c1)', rule: 'same_args[15,7]', sign: true},
                {id: 20, head: 'a@car', args: '(λ2,have@2@c1)', rule: 'same_args[15,7]', sign: false},
                {id: 21, head: 'expensive@car', args: 'c2', rule: 'up_mon_fun[19,20]', sign: true},
                {id: 22, head: 'car', args: 'c2', rule: 'up_mon_fun[19,20]', sign: false},
                {id: 23, head: 'car', args: 'c2', rule:'int_mod_tr[21]', sign: true},
                {id: 24, head: 'expensive', args: 'c2', rule:'int_mod_tr[21]', sign: true},
                {end: true, rule: 'cl_subsmption[23,22]'}
            ]
        }
    ]
};
