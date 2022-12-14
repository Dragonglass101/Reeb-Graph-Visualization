from asyncore import write
from sys import argv, exit
from collections import OrderedDict

filename1 = argv[1]+'.off'
writeFileName = argv[1] + '_conv.gts'
file1=open(filename1)
writeFile = open(writeFileName, "w")

file1.readline()
line = file1.readline()
properties_count = line.split(' ')

vertex_count = int(properties_count[0])
face_count = int(properties_count[1])
# edge count remaining

lines_read = file1.readlines()

vertex_temp_list = lines_read[0: vertex_count]
vertex_list = list()
for i in range(len(vertex_temp_list)):
    temp = vertex_temp_list[i].split(' ')
    # temp = [int(float(i)) for i in temp]
    # for float_ver in temp:

    vertex_list.append(temp)

face_temp_list = lines_read[vertex_count: face_count+vertex_count]

print(len(vertex_list))
print(len(face_temp_list))

face_list = list()

#Creating an Ordered Dictionary that maps vertex pair to its edge number
tank = OrderedDict()

edge_index = 0

for i in range(face_count):
    v_connected = face_temp_list[i].split(' ')
    #First element is 3 then followed by the 3 vertices that make up the face
    v1 = int(v_connected[1])
    v2 = int(v_connected[2])
    v3 = int(v_connected[3])

    vs = [v1,v2,v3]
    vs.sort()
    pairs = [(vs[0],vs[1]), (vs[1],vs[2]), (vs[0],vs[2])]

    temp = list()
    for p in pairs:
        if p in tank:
            temp.append(tank[p])
        else:
            tank[p] = edge_index
            temp.append(tank[p])
            edge_index += 1
    
    face_list.append(temp)

#Finally the edge index will give us total edge count
edge_count = edge_index

inv_tank = {v: k for k, v in tank.items()}


writeFile.write(str(vertex_count) + ' ' + str(edge_count) + ' ' + str(face_count) +'\n')

for i in range(vertex_count):
    writeFile.write( str(vertex_list[i][0]) + ' ' + str(vertex_list[i][1]) + ' ' + str(vertex_list[i][2]))

for i in range(edge_count):
    writeFile.write( str(inv_tank[i][0] + 1) + ' ' + str(inv_tank[i][1] + 1) + '\n')

for i in range(face_count):
    writeFile.write( str(face_list[i][0] + 1) + ' ' + str(face_list[i][1] + 1) + ' ' + str(face_list[i][2] + 1) + '\n') 

