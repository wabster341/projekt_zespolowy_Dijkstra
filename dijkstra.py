from graph import Graph
from sys import maxsize
import csv

def find_distance(graph: Graph, x, y):
    x = graph.m_adj_list.get(x)
    for i in x:
        if i[0] == y:
            return i[1]
    return None

def find_route_distance(graph: Graph, ls: list):
    sum = 0
    for i in range(len(ls)-1):
        sum += find_distance(graph, ls[i], ls[i+1])
    return sum

def dijkstra(graph: Graph, source: int, target: int):
    tentative_distance = [(i, maxsize) for i in graph.m_nodes]
    tentative_distance[source] = (source, 0)
    route = [-1 for i in graph.m_nodes]

    while tentative_distance is not None:
        list_of_vertices = [i[0] for i in tentative_distance]
        minimal_distance = min([i[1] for i in tentative_distance])
        minimal_distance_vertixes = [
            i for i in tentative_distance if i[1] == minimal_distance]

        if target in [i[0] for i in minimal_distance_vertixes]:
            true_route = []
            point = target
            while point != -1:
                true_route.append(point)
                point = route[point]
            true_route.reverse()

            return (target, true_route, find_route_distance(graph, true_route))
        minimal_distance_vertix = minimal_distance_vertixes[0]

        for i in graph.m_adj_list.get(minimal_distance_vertix[0]):
            if i[0] in list_of_vertices:
                current_dist = i[1] + minimal_distance_vertix[1]
                current_vertix = [
                    node for node in tentative_distance if node[0] == i[0]][0]
                if current_dist <= current_vertix[1]:
                    tentative_distance[tentative_distance.index(
                        current_vertix)] = (i[0], current_dist)
                    route[current_vertix[0]] = minimal_distance_vertix[0]

        tentative_distance.remove(minimal_distance_vertix)


graph = Graph(6, False)

graph.add_edge(0, 1, 2)
graph.add_edge(0, 2, 1)
graph.add_edge(1, 3, 2)
graph.add_edge(1, 4, 3)
graph.add_edge(2, 4, 6)
graph.add_edge(2, 5, 2)
graph.add_edge(3, 5, 7)
graph.add_edge(4, 5, 1)

iris = []
with open("test.csv", "r") as f:
    for row in csv.reader(f):
        for i in range(len(row)):
            row[i] = int(row[i]) # konwersja z str na float
        iris.append(row)

def csv_to_graph(ls):
    list_vertices = []
    for i in range(len(ls)):
        list_vertices.append(ls[i][0])
        list_vertices.append(ls[i][2])
    print(type(list_vertices))
    number_vertices = len(set(list_vertices))
    graph_ls = Graph(number_vertices, False)
    for i in range(len(ls)):
        graph_ls.add_edge(ls[i][0], ls[i][1], ls[i][2])
    return(graph_ls)


a = csv_to_graph(iris)
